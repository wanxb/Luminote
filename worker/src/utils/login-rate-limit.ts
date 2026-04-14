const MAX_FAILED_ATTEMPTS = 5;
const FAILED_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

type LoginAttemptState = {
  attempts: number[];
  blockedUntil: number;
};

const attemptsByClient = new Map<string, LoginAttemptState>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")
    ?? request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

function getState(clientKey: string, now: number) {
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

export function getLoginRateLimit(request: Request) {
  const now = Date.now();
  const clientKey = getClientKey(request);
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

export function recordFailedLoginAttempt(request: Request) {
  const now = Date.now();
  const clientKey = getClientKey(request);
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

export function clearFailedLoginAttempts(request: Request) {
  attemptsByClient.delete(getClientKey(request));
}
