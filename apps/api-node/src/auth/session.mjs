function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index < 0) {
          return [part, ""];
        }

        return [
          part.slice(0, index),
          decodeURIComponent(part.slice(index + 1)),
        ];
      }),
  );
}

export function isAuthenticated(request, config) {
  const cookies = parseCookies(request.headers.cookie || null);
  return cookies[config.sessionCookieName] === config.adminSessionToken;
}

export function appendSessionCookie(response, request, config) {
  const sameSite = resolveSameSite(config.adminCookieSameSite);
  const isHttps = shouldUseSecureCookie(request, config, sameSite);

  const cookie = [
    `${config.sessionCookieName}=${encodeURIComponent(config.adminSessionToken)}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    isHttps ? "Secure" : "",
    `Max-Age=${60 * 60 * 2}`,
  ]
    .filter(Boolean)
    .join("; ");

  response.setHeader("Set-Cookie", cookie);
}

export function clearSessionCookie(response, request, config) {
  const sameSite = resolveSameSite(config.adminCookieSameSite);
  const isHttps = shouldUseSecureCookie(request, config, sameSite);

  const cookie = [
    `${config.sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    isHttps ? "Secure" : "",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");

  response.setHeader("Set-Cookie", cookie);
}

function resolveSameSite(value) {
  const normalized = String(value || "Lax").trim().toLowerCase();

  if (normalized === "strict") {
    return "Strict";
  }

  if (normalized === "none") {
    return "None";
  }

  return "Lax";
}

function shouldUseSecureCookie(request, config, sameSite) {
  const secureMode = String(config.adminCookieSecure || "auto")
    .trim()
    .toLowerCase();

  if (secureMode === "true") {
    return true;
  }

  if (secureMode === "false") {
    return sameSite === "None";
  }

  return (
    sameSite === "None" ||
    request.headers["x-forwarded-proto"] === "https" ||
    request.socket.encrypted
  );
}
