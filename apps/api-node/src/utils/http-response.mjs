export function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

export function sendSuccess(res, payload = {}, status = 200) {
  sendJson(res, status, payload);
}

export function sendError(res, status, error, payload = {}) {
  sendJson(res, status, {
    ok: false,
    error,
    ...payload,
  });
}

export function sendUnauthorized(res, message = "Unauthorized") {
  sendError(res, 401, message);
}

export function sendTooManyRequests(res, message = "Too Many Requests", retryAfterSeconds = 60) {
  res.writeHead(429, {
    "content-type": "application/json; charset=utf-8",
    "retry-after": String(retryAfterSeconds),
  });
  res.end(JSON.stringify({
    ok: false,
    error: message,
    retryAfterSeconds,
  }));
}

export function sendNotFound(res, message = "Not Found") {
  sendError(res, 404, message);
}

export function sendValidationError(res, error, payload = {}) {
  sendError(res, 400, error, payload);
}

export function resolveMutationStatus(result, fallback = 400) {
  if (result?.ok) {
    return 200;
  }

  const message = String(result?.error || "").toLowerCase();

  if (message.includes("not found")) {
    return 404;
  }

  return fallback;
}
