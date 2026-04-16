import path from "node:path";

export function loadRuntimeConfig() {
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 8788);
  const publicBaseUrl =
    process.env.PUBLIC_BASE_URL || `http://${host}:${port}`;
  const contentSource = process.env.CONTENT_SOURCE || "memory";
  const persistenceDriver = process.env.PERSISTENCE_DRIVER || "file";
  const dataFile =
    process.env.DATA_FILE ||
    path.resolve(process.cwd(), "apps/api-node/data/public-content.json");
  const sqliteDbFile =
    process.env.SQLITE_DB_FILE ||
    path.resolve(process.cwd(), "apps/api-node/data/luminote.sqlite");
  const storageMode = process.env.STORAGE_MODE || "local";
  const uploadsDir =
    process.env.UPLOADS_DIR ||
    path.resolve(process.cwd(), "apps/api-node/data/uploads");
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";
  const adminSessionToken =
    process.env.ADMIN_SESSION_TOKEN || "local-node-admin-session-token";
  const sessionCookieName =
    process.env.ADMIN_SESSION_COOKIE_NAME || "luminote_admin_session";
  const corsAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS || "";
  const adminCookieSameSite = process.env.ADMIN_COOKIE_SAME_SITE || "Lax";
  const adminCookieSecure = process.env.ADMIN_COOKIE_SECURE || "auto";

  return {
    host,
    port,
    publicBaseUrl,
    contentSource,
    persistenceDriver,
    dataFile,
    sqliteDbFile,
    storageMode,
    uploadsDir,
    adminPassword,
    adminPasswordHash,
    adminSessionToken,
    sessionCookieName,
    corsAllowedOrigins,
    adminCookieSameSite,
    adminCookieSecure,
  };
}
