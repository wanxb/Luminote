import type { Env } from "../index";
import { json } from "../utils/json";

export function handleSite(_request: Request, env: Env): Response {
  return json({
    siteTitle: env.SITE_TITLE,
    siteDescription: "A lightweight home for photography that lets the work breathe.",
    watermarkEnabledByDefault: env.WATERMARK_ENABLED_BY_DEFAULT === "true",
    watermarkText: env.WATERMARK_TEXT
  });
}
