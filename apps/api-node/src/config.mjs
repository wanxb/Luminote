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
  const storageMode = process.env.STORAGE_MODE || "mock";
  const uploadsDir =
    process.env.UPLOADS_DIR ||
    path.resolve(process.cwd(), "apps/api-node/data/uploads");
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme";
  const adminSessionToken =
    process.env.ADMIN_SESSION_TOKEN || "local-node-admin-session-token";
  const sessionCookieName =
    process.env.ADMIN_SESSION_COOKIE_NAME || "luminote_admin_session";

  return {
    host,
    port,
    publicBaseUrl,
    contentSource,
    persistenceDriver,
    dataFile,
    storageMode,
    uploadsDir,
    adminPassword,
    adminSessionToken,
    sessionCookieName,
  };
}
