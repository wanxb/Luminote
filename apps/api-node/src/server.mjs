import { createServer } from "node:http";
import { loadRuntimeConfig } from "./config.mjs";
import {
  createAdminContentRepository,
  createPublicContentRepository,
} from "./repositories/index.mjs";
import { handleAdminRoute } from "./routes/admin.mjs";
import { handlePublicRoute } from "./routes/public.mjs";
import { createAssetStorage } from "./storage/index.mjs";
import { buildMockStorageSvg } from "./mock-storage.mjs";
import { applyCorsHeaders, createCorsPreflightResponse } from "./utils/cors.mjs";
import { sendError, sendJson } from "./utils/http-response.mjs";

const config = loadRuntimeConfig();
const { host, port } = config;

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);
  const requestConfig = {
    ...config,
    publicBaseUrl: url.origin,
  };
  const repository = createPublicContentRepository(requestConfig);
  const adminRepository = createAdminContentRepository(requestConfig);
  const assetStorage = createAssetStorage(requestConfig);
  applyCorsHeaders(req, res, requestConfig);

  if (req.method === "OPTIONS") {
    createCorsPreflightResponse(res);
    return;
  }

  if (url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "luminote-api-node",
      runtime: "node",
    });
    return;
  }

  try {
    const handled = await handlePublicRoute({
      req,
      res,
      url,
      repository,
      sendJson,
    });

    if (handled) {
      return;
    }

    const handledAdmin = await handleAdminRoute({
      req,
      res,
      url,
      config: requestConfig,
      repository: adminRepository,
      assetStorage,
      sendJson,
    });

    if (handledAdmin) {
      return;
    }

    if (url.pathname.startsWith("/assets/") && req.method === "GET") {
      const parts = url.pathname.split("/").filter(Boolean);
      const variant = parts[1];
      const id = parts[2] || "unknown";
      const asset =
        variant === "avatar"
          ? await assetStorage.getAvatarAsset(id)
          : await assetStorage.getPhotoAsset(variant, id);

      if (asset) {
        res.writeHead(200, {
          "content-type": asset.contentType,
          "cache-control": "public, max-age=3600",
        });
        res.end(asset.body);
        return;
      }

      const mockVariant =
        variant === "original"
          ? "display"
          : variant === "thumb"
          ? "thumb"
          : variant === "display-watermarked"
            ? "watermarked"
            : variant === "avatar"
              ? "avatar"
              : "display";

      res.writeHead(200, {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=60",
      });
      res.end(buildMockStorageSvg(mockVariant, id));
      return;
    }

    sendError(res, 404, "Not Found");
  } catch (error) {
    console.error("[api-node] request failed", error);
    sendError(res, 500, "Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`luminote-api-node listening on http://${host}:${port}`);
});
