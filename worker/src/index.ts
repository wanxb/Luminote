import { json } from "./utils/json";
import { applyCors, createCorsPreflight } from "./utils/cors";
import { handleSite } from "./routes/site";
import { handlePhotos } from "./routes/photos";
import { handleAdmin } from "./routes/admin";
import { handleMockStorage } from "./routes/mock-storage";
import { handleAssets } from "./routes/assets";

export interface Env {
  SITE_TITLE: string;
  WATERMARK_ENABLED_BY_DEFAULT: string;
  WATERMARK_TEXT: string;
  ADMIN_PASSWORD: string;
  ADMIN_SESSION_TOKEN: string;
  CORS_ALLOWED_ORIGINS?: string;
  ADMIN_COOKIE_SAME_SITE?: string;
  ADMIN_COOKIE_SECURE?: string;
  DB?: D1Database;
  PHOTOS_BUCKET?: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return createCorsPreflight(request, env.CORS_ALLOWED_ORIGINS);
    }

    if (url.pathname === "/api/health") {
      return applyCors(
        request,
        json({
          ok: true,
          service: "luminote-api",
          date: "2026-04-02"
        }),
        env.CORS_ALLOWED_ORIGINS,
      );
    }

    if (url.pathname.startsWith("/api/site")) {
      return applyCors(
        request,
        await handleSite(request, env),
        env.CORS_ALLOWED_ORIGINS,
      );
    }

    if (url.pathname.startsWith("/api/photos")) {
      return applyCors(
        request,
        await handlePhotos(request, env),
        env.CORS_ALLOWED_ORIGINS,
      );
    }

    if (url.pathname.startsWith("/api/admin")) {
      return applyCors(
        request,
        await handleAdmin(request, env),
        env.CORS_ALLOWED_ORIGINS,
      );
    }

    if (url.pathname.startsWith("/assets/")) {
      return handleAssets(request, env);
    }

    if (url.pathname.startsWith("/mock-storage/")) {
      return handleMockStorage(request);
    }

    return applyCors(
      request,
      json(
        {
          ok: false,
          error: "Not Found"
        },
        { status: 404 },
      )
      ,
      env.CORS_ALLOWED_ORIGINS,
    );
  }
};
