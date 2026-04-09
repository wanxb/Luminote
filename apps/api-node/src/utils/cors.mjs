function normalizeOrigin(origin) {
  try {
    return new URL(origin).origin;
  } catch {
    return "";
  }
}

function isLoopbackOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function getAllowedOrigins(config) {
  return new Set(
    String(config.corsAllowedOrigins || "")
      .split(",")
      .map((value) => normalizeOrigin(value.trim()))
      .filter(Boolean),
  );
}

function resolveAllowedOrigin(origin, config) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return "";
  }

  if (isLoopbackOrigin(normalizedOrigin)) {
    return normalizedOrigin;
  }

  const allowedOrigins = getAllowedOrigins(config);
  return allowedOrigins.has(normalizedOrigin) ? normalizedOrigin : "";
}

export function applyCorsHeaders(req, res, config) {
  const origin = req.headers.origin;

  if (!origin) {
    return;
  }

  const allowedOrigin = resolveAllowedOrigin(origin, config);

  if (!allowedOrigin) {
    return;
  }

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "content-type",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export function createCorsPreflightResponse(res) {
  res.writeHead(204);
  res.end();
}
