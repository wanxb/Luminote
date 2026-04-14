const MAX_FAILED_ATTEMPTS = 5;
const FAILED_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

const attemptsByClient = new Map();

function getClientKey(req) {
  const forwardedFor =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

function getState(clientKey, now) {
  const current = attemptsByClient.get(clientKey);

  if (!current) {
    const initial = { attempts: [], blockedUntil: 0 };
    attemptsByClient.set(clientKey, initial);
    return initial;
  }

  current.attempts = current.attempts.filter(
    (attemptAt) => now - attemptAt <= FAILED_ATTEMPT_WINDOW_MS,
  );

  if (current.blockedUntil <= now) {
    current.blockedUntil = 0;
  }

  if (current.attempts.length === 0 && current.blockedUntil === 0) {
    attemptsByClient.delete(clientKey);
    const initial = { attempts: [], blockedUntil: 0 };
    attemptsByClient.set(clientKey, initial);
    return initial;
  }

  return current;
}

export function getLoginRateLimit(req) {
  const now = Date.now();
  const clientKey = getClientKey(req);
  const state = getState(clientKey, now);
  const retryAfterSeconds =
    state.blockedUntil > now
      ? Math.max(1, Math.ceil((state.blockedUntil - now) / 1000))
      : 0;

  return {
    blocked: retryAfterSeconds > 0,
    retryAfterSeconds,
    clientKey,
  };
}

export function recordFailedLoginAttempt(req) {
  const now = Date.now();
  const clientKey = getClientKey(req);
  const state = getState(clientKey, now);

  state.attempts.push(now);

  if (state.attempts.length >= MAX_FAILED_ATTEMPTS) {
    state.blockedUntil = now + BLOCK_DURATION_MS;
    state.attempts = [];
  }

  attemptsByClient.set(clientKey, state);

  return {
    retryAfterSeconds:
      state.blockedUntil > now
        ? Math.max(1, Math.ceil((state.blockedUntil - now) / 1000))
        : 0,
  };
}

export function clearFailedLoginAttempts(req) {
  attemptsByClient.delete(getClientKey(req));
}
