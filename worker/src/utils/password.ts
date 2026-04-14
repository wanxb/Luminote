const PBKDF2_ALGORITHM = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_SALT_LENGTH = 16;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8,
  );

  return new Uint8Array(bits);
}

function parsePasswordHash(value: string) {
  const [algorithm, iterationText, salt, hash] = value.split("$");
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

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH));
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS);

  return [
    PBKDF2_ALGORITHM,
    String(PBKDF2_ITERATIONS),
    bytesToBase64Url(salt),
    bytesToBase64Url(hash),
  ].join("$");
}

export async function verifyPassword(password: string, passwordHash: string) {
  const parsed = parsePasswordHash(passwordHash);

  if (!parsed) {
    return false;
  }

  const derived = await deriveKey(password, parsed.salt, parsed.iterations);
  return timingSafeEqual(derived, parsed.hash);
}
