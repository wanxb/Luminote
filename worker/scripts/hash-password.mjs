import { pbkdf2Sync, randomBytes } from "node:crypto";

const PBKDF2_ALGORITHM = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_SALT_LENGTH = 16;

function toBase64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-new-password"');
  process.exit(1);
}

const salt = randomBytes(PBKDF2_SALT_LENGTH);
const hash = pbkdf2Sync(
  password,
  salt,
  PBKDF2_ITERATIONS,
  PBKDF2_KEY_LENGTH,
  "sha256",
);

console.log(
  `ADMIN_PASSWORD_HASH=${[
    PBKDF2_ALGORITHM,
    String(PBKDF2_ITERATIONS),
    toBase64Url(salt),
    toBase64Url(hash),
  ].join("$")}`,
);
