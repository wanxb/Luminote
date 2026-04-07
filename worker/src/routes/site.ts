import type { Env } from "../index";
import {
  getSiteConfig,
  updateSiteConfig,
} from "../services/site-config-service";
import { TEXT_LIMITS, isWithinTextLimit } from "../utils/text-limits";
import { json } from "../utils/json";

function resolvePublicAssetUrl(request: Request, assetUrl: string) {
  const trimmed = assetUrl.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return new URL(trimmed, request.url).toString();
}

function validateTextField(
  value: string,
  maxLength: number,
  emptyMessage: string,
  tooLongMessage: string,
  options?: { allowEmpty?: boolean },
) {
  const trimmed = value.trim();

  if (!options?.allowEmpty && trimmed.length === 0) {
    return { ok: false as const, error: emptyMessage };
  }

  if (!isWithinTextLimit(trimmed, maxLength)) {
    return { ok: false as const, error: tooLongMessage };
  }

  return { ok: true as const, value: trimmed };
}

export async function handleSite(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method === "PATCH") {
    return handleSiteUpdate(request, env);
  }

  const config = await getSiteConfig(env);

  return json({
    siteTitle: config.siteTitle,
    siteDescription: config.siteDescription,
    watermarkEnabledByDefault: config.watermarkEnabledByDefault,
    watermarkText: config.watermarkText,
    uploadOriginalEnabled: config.uploadOriginalEnabled,
    maxTagPoolSize: config.maxTagPoolSize,
    maxUploadFiles: config.maxUploadFiles,
    maxTagsPerPhoto: config.maxTagsPerPhoto,
    photographerAvatarUrl: resolvePublicAssetUrl(
      request,
      config.photographerAvatarUrl,
    ),
    photographerName: config.photographerName,
    photographerBio: config.photographerBio,
    photographerEmail: config.photographerEmail,
    photographerXiaohongshu: config.photographerXiaohongshu,
    photographerXiaohongshuUrl: config.photographerXiaohongshuUrl,
    photographerDouyin: config.photographerDouyin,
    photographerDouyinUrl: config.photographerDouyinUrl,
    photographerInstagram: config.photographerInstagram,
    photographerInstagramUrl: config.photographerInstagramUrl,
    photographerCustomAccount: config.photographerCustomAccount,
    photographerCustomAccountUrl: config.photographerCustomAccountUrl,
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
      uploadOriginalEnabled?: boolean;
      maxTagPoolSize?: number;
      maxUploadFiles?: number;
      maxTagsPerPhoto?: number;
      photographerAvatarUrl?: string;
      photographerName?: string;
      photographerBio?: string;
      photographerEmail?: string;
      photographerXiaohongshu?: string;
      photographerXiaohongshuUrl?: string;
      photographerDouyin?: string;
      photographerDouyinUrl?: string;
      photographerInstagram?: string;
      photographerInstagramUrl?: string;
      photographerCustomAccount?: string;
      photographerCustomAccountUrl?: string;
    };

    const updates: {
      siteTitle?: string;
      siteDescription?: string;
      watermarkEnabledByDefault?: boolean;
      watermarkText?: string;
      adminPassword?: string;
      uploadOriginalEnabled?: boolean;
      maxTagPoolSize?: number;
      maxUploadFiles?: number;
      maxTagsPerPhoto?: number;
      photographerAvatarUrl?: string;
      photographerName?: string;
      photographerBio?: string;
      photographerEmail?: string;
      photographerXiaohongshu?: string;
      photographerXiaohongshuUrl?: string;
      photographerDouyin?: string;
      photographerDouyinUrl?: string;
      photographerInstagram?: string;
      photographerInstagramUrl?: string;
      photographerCustomAccount?: string;
      photographerCustomAccountUrl?: string;
    } = {};
    const errors: string[] = [];

    if (body.siteTitle !== undefined) {
      if (
        typeof body.siteTitle !== "string" ||
        body.siteTitle.trim().length === 0
      ) {
        errors.push("站点标题不能为空。");
      } else {
        const result = validateTextField(
          body.siteTitle,
          TEXT_LIMITS.siteTitle,
          "站点标题不能为空。",
          `站点标题不能超过 ${TEXT_LIMITS.siteTitle} 个字符。`,
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.siteTitle = result.value;
        }
      }
    }

    if (body.siteDescription !== undefined) {
      if (typeof body.siteDescription !== "string") {
        errors.push("站点简介格式错误。");
      } else {
        const result = validateTextField(
          body.siteDescription,
          TEXT_LIMITS.siteDescription,
          "站点简介格式错误。",
          `站点简介不能超过 ${TEXT_LIMITS.siteDescription} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.siteDescription = result.value;
        }
      }
    }

    if (body.watermarkEnabledByDefault !== undefined) {
      if (typeof body.watermarkEnabledByDefault !== "boolean") {
        errors.push("水印默认开关格式错误。");
      } else {
        updates.watermarkEnabledByDefault = body.watermarkEnabledByDefault;
      }
    }

    if (body.watermarkText !== undefined) {
      if (
        typeof body.watermarkText !== "string" ||
        body.watermarkText.trim().length === 0
      ) {
        errors.push("水印文本不能为空。");
      } else {
        const result = validateTextField(
          body.watermarkText,
          TEXT_LIMITS.watermarkText,
          "水印文本不能为空。",
          `水印文本不能超过 ${TEXT_LIMITS.watermarkText} 个字符。`,
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.watermarkText = result.value;
        }
      }
    }

    if (body.adminPassword !== undefined) {
      if (
        typeof body.adminPassword !== "string" ||
        body.adminPassword.length < 6
      ) {
        errors.push("管理员密码至少需要 6 个字符。");
      } else if (!isWithinTextLimit(body.adminPassword, TEXT_LIMITS.password)) {
        errors.push(`管理员密码不能超过 ${TEXT_LIMITS.password} 个字符。`);
      } else {
        updates.adminPassword = body.adminPassword;
      }
    }

    if (body.uploadOriginalEnabled !== undefined) {
      if (typeof body.uploadOriginalEnabled !== "boolean") {
        errors.push("原图上传开关格式错误。");
      } else {
        updates.uploadOriginalEnabled = body.uploadOriginalEnabled;
      }
    }

    if (body.maxTagPoolSize !== undefined) {
      if (!Number.isInteger(body.maxTagPoolSize) || body.maxTagPoolSize <= 0) {
        errors.push("标签总数上限必须是正整数。");
      } else {
        updates.maxTagPoolSize = body.maxTagPoolSize;
      }
    }

    if (body.maxUploadFiles !== undefined) {
      if (!Number.isInteger(body.maxUploadFiles) || body.maxUploadFiles <= 0) {
        errors.push("批量上传数量上限必须是正整数。");
      } else {
        updates.maxUploadFiles = body.maxUploadFiles;
      }
    }

    if (body.maxTagsPerPhoto !== undefined) {
      if (
        !Number.isInteger(body.maxTagsPerPhoto) ||
        body.maxTagsPerPhoto <= 0
      ) {
        errors.push("单张图片标签上限必须是正整数。");
      } else {
        updates.maxTagsPerPhoto = body.maxTagsPerPhoto;
      }
    }

    if (body.photographerAvatarUrl !== undefined) {
      if (typeof body.photographerAvatarUrl !== "string") {
        errors.push("摄影师头像链接格式错误。");
      } else {
        const result = validateTextField(
          body.photographerAvatarUrl,
          TEXT_LIMITS.url,
          "摄影师头像链接格式错误。",
          `摄影师头像链接不能超过 ${TEXT_LIMITS.url} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerAvatarUrl = result.value;
        }
      }
    }

    if (body.photographerName !== undefined) {
      if (typeof body.photographerName !== "string") {
        errors.push("摄影师姓名格式错误。");
      } else {
        const result = validateTextField(
          body.photographerName,
          TEXT_LIMITS.photographerName,
          "摄影师姓名格式错误。",
          `摄影师姓名不能超过 ${TEXT_LIMITS.photographerName} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerName = result.value;
        }
      }
    }

    if (body.photographerBio !== undefined) {
      if (typeof body.photographerBio !== "string") {
        errors.push("摄影师简介格式错误。");
      } else {
        const result = validateTextField(
          body.photographerBio,
          TEXT_LIMITS.photographerBio,
          "摄影师简介格式错误。",
          `摄影师简介不能超过 ${TEXT_LIMITS.photographerBio} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerBio = result.value;
        }
      }
    }

    if (body.photographerEmail !== undefined) {
      if (typeof body.photographerEmail !== "string") {
        errors.push("邮箱格式错误。");
      } else {
        const result = validateTextField(
          body.photographerEmail,
          TEXT_LIMITS.email,
          "邮箱格式错误。",
          `邮箱不能超过 ${TEXT_LIMITS.email} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerEmail = result.value;
        }
      }
    }

    if (body.photographerXiaohongshu !== undefined) {
      if (typeof body.photographerXiaohongshu !== "string") {
        errors.push("小红书账号格式错误。");
      } else {
        const result = validateTextField(
          body.photographerXiaohongshu,
          TEXT_LIMITS.accountName,
          "小红书账号格式错误。",
          `小红书账号不能超过 ${TEXT_LIMITS.accountName} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerXiaohongshu = result.value;
        }
      }
    }

    if (body.photographerXiaohongshuUrl !== undefined) {
      if (typeof body.photographerXiaohongshuUrl !== "string") {
        errors.push("小红书链接格式错误。");
      } else {
        const result = validateTextField(
          body.photographerXiaohongshuUrl,
          TEXT_LIMITS.url,
          "小红书链接格式错误。",
          `小红书链接不能超过 ${TEXT_LIMITS.url} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerXiaohongshuUrl = result.value;
        }
      }
    }

    if (body.photographerDouyin !== undefined) {
      if (typeof body.photographerDouyin !== "string") {
        errors.push("抖音账号格式错误。");
      } else {
        const result = validateTextField(
          body.photographerDouyin,
          TEXT_LIMITS.accountName,
          "抖音账号格式错误。",
          `抖音账号不能超过 ${TEXT_LIMITS.accountName} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerDouyin = result.value;
        }
      }
    }

    if (body.photographerDouyinUrl !== undefined) {
      if (typeof body.photographerDouyinUrl !== "string") {
        errors.push("抖音链接格式错误。");
      } else {
        const result = validateTextField(
          body.photographerDouyinUrl,
          TEXT_LIMITS.url,
          "抖音链接格式错误。",
          `抖音链接不能超过 ${TEXT_LIMITS.url} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerDouyinUrl = result.value;
        }
      }
    }

    if (body.photographerInstagram !== undefined) {
      if (typeof body.photographerInstagram !== "string") {
        errors.push("Instagram 账号格式错误。");
      } else {
        const result = validateTextField(
          body.photographerInstagram,
          TEXT_LIMITS.accountName,
          "Instagram 账号格式错误。",
          `Instagram 账号不能超过 ${TEXT_LIMITS.accountName} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerInstagram = result.value;
        }
      }
    }

    if (body.photographerInstagramUrl !== undefined) {
      if (typeof body.photographerInstagramUrl !== "string") {
        errors.push("Instagram 链接格式错误。");
      } else {
        const result = validateTextField(
          body.photographerInstagramUrl,
          TEXT_LIMITS.url,
          "Instagram 链接格式错误。",
          `Instagram 链接不能超过 ${TEXT_LIMITS.url} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerInstagramUrl = result.value;
        }
      }
    }

    if (body.photographerCustomAccount !== undefined) {
      if (typeof body.photographerCustomAccount !== "string") {
        errors.push("自定义账号名称格式错误。");
      } else {
        const result = validateTextField(
          body.photographerCustomAccount,
          TEXT_LIMITS.accountName,
          "自定义账号名称格式错误。",
          `自定义账号名称不能超过 ${TEXT_LIMITS.accountName} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerCustomAccount = result.value;
        }
      }
    }

    if (body.photographerCustomAccountUrl !== undefined) {
      if (typeof body.photographerCustomAccountUrl !== "string") {
        errors.push("自定义账号链接格式错误。");
      } else {
        const result = validateTextField(
          body.photographerCustomAccountUrl,
          TEXT_LIMITS.url,
          "自定义账号链接格式错误。",
          `自定义账号链接不能超过 ${TEXT_LIMITS.url} 个字符。`,
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.photographerCustomAccountUrl = result.value;
        }
      }
    }

    if (errors.length > 0) {
      return json(
        {
          ok: false,
          error: errors.join(" "),
        },
        { status: 400 },
      );
    }

    const result = await updateSiteConfig(env, updates);

    if (!result.ok) {
      return json(
        {
          ok: false,
          error: result.error ?? "保存配置失败。",
        },
        { status: 400 },
      );
    }

    return json({
      ok: true,
      message: "站点配置已更新。",
    });
  } catch {
    return json(
      {
        ok: false,
        error: "请求格式错误。",
      },
      { status: 400 },
    );
  }
}
