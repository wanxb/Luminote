import { mkdtemp, cp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const mode = process.argv[2] || "file";
const port = String(8890 + Math.floor(Math.random() * 100));
const host = "127.0.0.1";
const baseUrl = `http://${host}:${port}`;
const adminPassword = "smoke-test-password";
const sessionToken = `smoke-session-${Date.now()}`;

async function waitForServer(url, timeoutMs = 15000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for server at ${url}`);
}

function createCookieHeader(response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("Missing session cookie.");
  }

  return setCookie.split(";")[0];
}

async function main() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "luminote-api-smoke-"));
  const dataFile = path.join(tempRoot, "public-content.json");
  const sqliteDbFile = path.join(tempRoot, "luminote.sqlite");
  const uploadsDir = path.join(tempRoot, "uploads");
  const seedFile = path.join(appRoot, "data", "public-content.json");

  await cp(seedFile, dataFile);

  const env = {
    ...process.env,
    HOST: host,
    PORT: port,
    PUBLIC_BASE_URL: baseUrl,
    CONTENT_SOURCE: "file",
    PERSISTENCE_DRIVER: mode,
    DATA_FILE: dataFile,
    SQLITE_DB_FILE: sqliteDbFile,
    STORAGE_MODE: "local",
    UPLOADS_DIR: uploadsDir,
    ADMIN_PASSWORD: adminPassword,
    ADMIN_SESSION_TOKEN: sessionToken,
  };

  const child = spawn(process.execPath, ["src/server.mjs"], {
    cwd: appRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer(`${baseUrl}/api/health`);

    const siteResponse = await fetch(`${baseUrl}/api/site`);
    const site = await siteResponse.json();

    const missingPhotoResponse = await fetch(`${baseUrl}/api/photos/does-not-exist`);
    const missingPhoto = await missingPhotoResponse.json();

    const unauthorizedResponse = await fetch(`${baseUrl}/api/admin/photos`);
    const unauthorizedBody = await unauthorizedResponse.json();

    const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        password: adminPassword,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed with status ${loginResponse.status}`);
    }

    const cookie = createCookieHeader(loginResponse);

    const sessionResponse = await fetch(`${baseUrl}/api/admin/session`, {
      headers: {
        cookie,
      },
    });
    const session = await sessionResponse.json();

    const tagName = `smoke-${mode}`;
    const createTagResponse = await fetch(`${baseUrl}/api/admin/tags`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        name: tagName,
      }),
    });
    const createTag = await createTagResponse.json();

    const sitePatchResponse = await fetch(`${baseUrl}/api/admin/site`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        siteTitle: `Smoke ${mode}`,
      }),
    });
    const sitePatch = await sitePatchResponse.json();

    const photoPatchResponse = await fetch(`${baseUrl}/api/admin/photos/photo_node_001`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        description: `Smoke updated ${mode}`,
      }),
    });
    const photoPatch = await photoPatchResponse.json();

    const adminPhotosResponse = await fetch(`${baseUrl}/api/admin/photos`, {
      headers: {
        cookie,
      },
    });
    const adminPhotos = await adminPhotosResponse.json();

    const tagsResponse = await fetch(`${baseUrl}/api/admin/tags`, {
      headers: {
        cookie,
      },
    });
    const tags = await tagsResponse.json();

    if (!session.authenticated) {
      throw new Error("Session check failed.");
    }

    if (missingPhotoResponse.status !== 404 || missingPhoto.error !== "Photo not found") {
      throw new Error("Missing photo contract check failed.");
    }

    if (unauthorizedResponse.status !== 401 || unauthorizedBody.error !== "Please log in first.") {
      throw new Error("Unauthorized contract check failed.");
    }

    if (!createTag.ok) {
      throw new Error(createTag.error || "Tag creation failed.");
    }

    if (!sitePatch.ok) {
      throw new Error(sitePatch.error || "Site update failed.");
    }

    if (!photoPatch.ok) {
      throw new Error(photoPatch.error || "Photo update failed.");
    }

    console.log(
      JSON.stringify({
        ok: true,
        mode,
        siteTitle: site.siteTitle,
        authenticated: session.authenticated,
        missingPhotoStatus: missingPhotoResponse.status,
        unauthorizedStatus: unauthorizedResponse.status,
        createdTag: createTag.tag?.name || null,
        tagCount: Array.isArray(tags.tags) ? tags.tags.length : 0,
        adminPhotoCount: Array.isArray(adminPhotos.items) ? adminPhotos.items.length : 0,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      JSON.stringify({
        ok: false,
        mode,
        error: message,
        stderr: stderr.trim() || null,
      }),
    );
    process.exitCode = 1;
  } finally {
    if (!child.killed) {
      child.kill("SIGTERM");
    }

    await new Promise((resolve) => {
      child.on("exit", resolve);
      setTimeout(resolve, 2000);
    });

    await rm(tempRoot, { recursive: true, force: true });
  }
}

main();
