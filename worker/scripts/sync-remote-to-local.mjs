import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const workerDir = process.cwd();
const wranglerBin = path.join(workerDir, "node_modules", ".bin", process.platform === "win32" ? "wrangler.cmd" : "wrangler");
const persistTo = path.join(workerDir, ".wrangler", "state", "local-speed");
const tempDir = mkdtempSync(path.join(tmpdir(), "luminote-sync-"));
const exportPath = path.join(tempDir, "remote-d1-export.sql");
const downloadDir = path.join(tempDir, "objects");
const bucketName = "luminote-dev";

function runWrangler(args, options = {}) {
  console.log(`\n> wrangler ${args.join(" ")}`);
  const command = process.platform === "win32" ? "cmd.exe" : wranglerBin;
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", wranglerBin, ...args] : args;

  return execFileSync(command, commandArgs, {
    cwd: workerDir,
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
    encoding: options.capture ? "utf8" : undefined,
  });
}

function runWranglerJson(args) {
  const output = runWrangler(args, { capture: true });
  return JSON.parse(output);
}

function inferExtension(fileName) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "jpg";
}

function inferContentType(objectKey) {
  const lowerKey = objectKey.toLowerCase();

  if (lowerKey.endsWith(".webp")) {
    return "image/webp";
  }

  if (lowerKey.endsWith(".png")) {
    return "image/png";
  }

  if (lowerKey.endsWith(".jpeg") || lowerKey.endsWith(".jpg")) {
    return "image/jpeg";
  }

  return "application/octet-stream";
}

function trySyncObject(objectKey) {
  const targetPath = path.join(downloadDir, objectKey.replace(/[\\/]/g, "__"));

  try {
    runWrangler([
      "r2",
      "object",
      "get",
      `${bucketName}/${objectKey}`,
      "--remote",
      "--file",
      targetPath,
    ]);
  } catch (error) {
    console.warn(`Skipping missing remote object: ${objectKey}`);
    return false;
  }

  runWrangler([
    "r2",
    "object",
    "put",
    `${bucketName}/${objectKey}`,
    "--local",
    "--persist-to",
    persistTo,
    "--file",
    targetPath,
    "--content-type",
    inferContentType(objectKey),
  ]);

  return true;
}

function extractAvatarKey(avatarUrl) {
  if (!avatarUrl) {
    return null;
  }

  const pathname = avatarUrl.startsWith("http") ? new URL(avatarUrl).pathname : avatarUrl;

  if (!pathname.startsWith("/assets/avatar/")) {
    return null;
  }

  return `avatars/${decodeURIComponent(pathname.slice("/assets/avatar/".length))}`;
}

mkdirSync(downloadDir, { recursive: true });
mkdirSync(persistTo, { recursive: true });

const photoResults = runWranglerJson([
  "d1",
  "execute",
  bucketName,
  "--remote",
  "--command",
  "SELECT id, original_file_name, watermark_enabled FROM photos ORDER BY created_at ASC;",
  "--json",
]);

const avatarResults = runWranglerJson([
  "d1",
  "execute",
  bucketName,
  "--remote",
  "--command",
  "SELECT photographer_avatar_url FROM site_config WHERE id = 1;",
  "--json",
]);

const photos = photoResults[0]?.results ?? [];
const avatarUrl = avatarResults[0]?.results?.[0]?.photographer_avatar_url ?? "";

console.log(`Preparing local reset in ${persistTo}`);
rmSync(path.join(persistTo, "d1"), { recursive: true, force: true });
rmSync(path.join(persistTo, "r2"), { recursive: true, force: true });

runWrangler([
  "d1",
  "export",
  bucketName,
  "--remote",
  "--output",
  exportPath,
]);

runWrangler([
  "d1",
  "execute",
  bucketName,
  "--local",
  "--persist-to",
  persistTo,
  "--file",
  exportPath,
  "--yes",
]);

const objectKeys = [];

for (const photo of photos) {
  const extension = inferExtension(String(photo.original_file_name ?? ""));
  const photoId = String(photo.id);

  objectKeys.push(`thumbs/${photoId}.webp`);
  objectKeys.push(`display/${photoId}.jpg`);

  if (Number(photo.watermark_enabled) === 1) {
    objectKeys.push(`display-watermarked/${photoId}.jpg`);
  }

  objectKeys.push(`originals/${photoId}.${extension}`);
}

const avatarKey = extractAvatarKey(avatarUrl);
if (avatarKey) {
  objectKeys.push(avatarKey);
}

const uniqueObjectKeys = [...new Set(objectKeys)];
let syncedCount = 0;

for (const objectKey of uniqueObjectKeys) {
  if (trySyncObject(objectKey)) {
    syncedCount += 1;
  }
}

console.log(`\nRemote D1 rows synced: ${photos.length} photos`);
console.log(`Remote R2 objects synced locally: ${syncedCount}/${uniqueObjectKeys.length}`);
console.log(`Local persistence directory: ${persistTo}`);

rmSync(tempDir, { recursive: true, force: true });