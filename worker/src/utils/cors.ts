function normalizeOrigin(origin: string) {
  try {
    return new URL(origin).origin;
  } catch {
    return "";
  }
}

function isLoopbackOrigin(origin: string) {
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

function getAllowedOrigins(allowedOriginsEnv?: string) {
  const configuredOrigins = (allowedOriginsEnv ?? "")
    .split(",")
    .map((value) => normalizeOrigin(value.trim()))
    .filter(Boolean);

  return new Set(configuredOrigins);
}

function resolveAllowedOrigin(origin: string, allowedOriginsEnv?: string) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return "";
  }

  if (isLoopbackOrigin(normalizedOrigin)) {
    return normalizedOrigin;
  }

  const allowedOrigins = getAllowedOrigins(allowedOriginsEnv);
  return allowedOrigins.has(normalizedOrigin) ? normalizedOrigin : "";
}

export function applyCors(
  request: Request,
  response: Response,
  allowedOriginsEnv?: string,
) {
  const origin = request.headers.get("origin");
  const allowedOrigin = origin
    ? resolveAllowedOrigin(origin, allowedOriginsEnv)
    : "";

  if (!allowedOrigin) {
    return response;
  }

  response.headers.set("access-control-allow-origin", allowedOrigin);
  response.headers.set("vary", "origin");
  response.headers.set(
    "access-control-allow-methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  response.headers.set(
    "access-control-allow-headers",
    request.headers.get("access-control-request-headers") ?? "content-type",
  );
  response.headers.set("access-control-allow-credentials", "true");

  return response;
}

export function createCorsPreflight(
  request: Request,
  allowedOriginsEnv?: string,
) {
  const response = new Response(null, { status: 204 });
  return applyCors(request, response, allowedOriginsEnv);
}
