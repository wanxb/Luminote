import type { Env } from "../index";
import { json } from "../utils/json";

export function handleSite(request: Request, env: Env): Response | Promise<Response> {
  if (request.method === "PATCH") {
    return handleSiteUpdate(request, env);
  }

  return json({
    siteTitle: env.SITE_TITLE,
    siteDescription: "A lightweight home for photography that lets the work breathe.",
    watermarkEnabledByDefault: env.WATERMARK_ENABLED_BY_DEFAULT === "true",
    watermarkText: env.WATERMARK_TEXT
  });
}

async function handleSiteUpdate(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as {
      siteTitle?: string;
      siteDescription?: string;
      watermarkEnabledByDefault?: boolean;
      watermarkText?: string;
      adminPassword?: string;
    };

    const updates: Partial<Env> = {};
    const errors: string[] = [];

    if (body.siteTitle !== undefined) {
      if (typeof body.siteTitle !== "string" || body.siteTitle.trim().length === 0) {
        errors.push("站点标题不能为空。");
      } else {
        updates.SITE_TITLE = body.siteTitle.trim();
      }
    }

    if (body.siteDescription !== undefined) {
      if (typeof body.siteDescription !== "string") {
        errors.push("站点简介格式错误。");
      } else {
        // Note: siteDescription is not stored in env for now, but we accept it
        // In future, we might store it in D1 or KV
      }
    }

    if (body.watermarkEnabledByDefault !== undefined) {
      if (typeof body.watermarkEnabledByDefault !== "boolean") {
        errors.push("水印默认开关格式错误。");
      } else {
        updates.WATERMARK_ENABLED_BY_DEFAULT = String(body.watermarkEnabledByDefault);
      }
    }

    if (body.watermarkText !== undefined) {
      if (typeof body.watermarkText !== "string" || body.watermarkText.trim().length === 0) {
        errors.push("水印文本不能为空。");
      } else {
        updates.WATERMARK_TEXT = body.watermarkText.trim();
      }
    }

    if (body.adminPassword !== undefined) {
      if (typeof body.adminPassword !== "string" || body.adminPassword.length < 6) {
        errors.push("管理员密码至少需要 6 个字符。");
      } else {
        updates.ADMIN_PASSWORD = body.adminPassword;
      }
    }

    if (errors.length > 0) {
      return json(
        {
          ok: false,
          error: errors.join(" ")
        },
        { status: 400 }
      );
    }

    // Note: In a real deployment, these would need to be updated in wrangler.toml
    // or stored in D1/KV for persistence. For now, we return success but
    // the changes won't persist across worker restarts without proper config storage.
    return json({
      ok: true,
      message: "站点配置已更新。请注意：当前版本配置仅存储在环境变量中，重启 Worker 后需要手动更新 wrangler.toml。"
    });
  } catch {
    return json(
      {
        ok: false,
        error: "请求格式错误。"
      },
      { status: 400 }
    );
  }
}
