import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const PBKDF2_ALGORITHM = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_SALT_LENGTH = 16;

function bytesToBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

function base64UrlToBytes(value) {
  return Buffer.from(value, "base64url");
}

function deriveKey(password, salt, iterations) {
  return pbkdf2Sync(password, salt, iterations, PBKDF2_KEY_LENGTH, "sha256");
}

function parsePasswordHash(value) {
  const [algorithm, iterationText, salt, hash] = String(value || "").split("$");
  const iterations = Number(iterationText);

  if (
    algorithm !== PBKDF2_ALGORITHM ||
    !Number.isInteger(iterations) ||
    iterations <= 0 ||
    !salt ||
    !hash
  ) {
    return null;
  }

  return {
    iterations,
    salt: base64UrlToBytes(salt),
    hash: base64UrlToBytes(hash),
  };
}

export function hashPassword(password) {
  const salt = randomBytes(PBKDF2_SALT_LENGTH);
  const hash = deriveKey(password, salt, PBKDF2_ITERATIONS);

  return [
    PBKDF2_ALGORITHM,
    String(PBKDF2_ITERATIONS),
    bytesToBase64Url(salt),
    bytesToBase64Url(hash),
  ].join("$");
}

export function verifyPassword(password, passwordHash) {
  const parsed = parsePasswordHash(passwordHash);

  if (!parsed) {
    return false;
  }

  const derived = deriveKey(password, parsed.salt, parsed.iterations);
  return timingSafeEqual(derived, parsed.hash);
}
