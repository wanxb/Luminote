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
  const isHttps =
    request.headers["x-forwarded-proto"] === "https" ||
    request.socket.encrypted;

  const cookie = [
    `${config.sessionCookieName}=${encodeURIComponent(config.adminSessionToken)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : "",
    `Max-Age=${60 * 60 * 2}`,
  ]
    .filter(Boolean)
    .join("; ");

  response.setHeader("Set-Cookie", cookie);
}

export function clearSessionCookie(response, request, config) {
  const isHttps =
    request.headers["x-forwarded-proto"] === "https" ||
    request.socket.encrypted;

  const cookie = [
    `${config.sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : "",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");

  response.setHeader("Set-Cookie", cookie);
}
