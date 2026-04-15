import type { Env } from "../index";
import {
  getSiteConfig,
  updateSiteConfig,
} from "../services/site-config-service";
import { getTagPool } from "../services/tag-service";
import { TEXT_LIMITS, isWithinTextLimit } from "../utils/text-limits";
import { json } from "../utils/json";
import {
  getPublicSite,
  getPublicSiteTags,
} from "../../../packages/core/src";
import type { SiteResponse } from "../../../packages/shared/src/api-types";
import { getLocaleMessages, normalizeLocale } from "../utils/i18n";

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

type SiteUpdateBody = {
  locale?: string;
  siteTitle?: string;
  siteDescription?: string;
  homeLayout?: string;
  watermarkEnabledByDefault?: boolean;
  watermarkText?: string;
  watermarkPosition?: string;
  adminPassword?: string;
  uploadOriginalEnabled?: boolean;
  maxTotalPhotos?: number;
  maxTagPoolSize?: number;
  maxUploadFiles?: number;
  maxTagsPerPhoto?: number;
  photoMetadataEnabled?: boolean;
  showDateInfo?: boolean;
  showCameraInfo?: boolean;
  showImageInfo?: boolean;
  showAdvancedCameraInfo?: boolean;
  showLocationInfo?: boolean;
  showDetailedExifInfo?: boolean;
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

const siteBooleanFields = new Set([
  "watermarkEnabledByDefault",
  "uploadOriginalEnabled",
  "photoMetadataEnabled",
  "showDateInfo",
  "showCameraInfo",
  "showImageInfo",
  "showAdvancedCameraInfo",
  "showLocationInfo",
  "showDetailedExifInfo",
]);

const siteNumberFields = new Set([
  "maxTotalPhotos",
  "maxTagPoolSize",
  "maxUploadFiles",
  "maxTagsPerPhoto",
]);

function coerceSiteUpdateValue(key: string, value: FormDataEntryValue | string) {
  if (value instanceof File) {
    return undefined;
  }

  if (siteBooleanFields.has(key)) {
    return value === "true" ? true : value === "false" ? false : value;
  }

  if (siteNumberFields.has(key)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}

function siteUpdateBodyFromEntries(
  entries: Iterable<[string, FormDataEntryValue | string]>,
) {
  const body: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    const coerced = coerceSiteUpdateValue(key, value);

    if (coerced !== undefined) {
      body[key] = coerced;
    }
  }

  return body as SiteUpdateBody;
}

async function readSiteUpdateBody(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    return siteUpdateBodyFromEntries(await request.formData());
  }

  const rawBody = (await request.text()).trim();

  if (!rawBody) {
    return {};
  }

  if (
    contentType.includes("application/json") ||
    rawBody.startsWith("{") ||
    rawBody.startsWith("[")
  ) {
    const parsed = JSON.parse(rawBody) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid JSON body");
    }

    return parsed as SiteUpdateBody;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    rawBody.includes("=")
  ) {
    return siteUpdateBodyFromEntries(new URLSearchParams(rawBody));
  }

  throw new Error("Unsupported request body");
}

export async function handleSite(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const reader = {
    async getSite() {
      const config = await getSiteConfig(env);

      return {
        locale: config.locale as SiteResponse["locale"],
        siteTitle: config.siteTitle,
        siteDescription: config.siteDescription,
        homeLayout: config.homeLayout as SiteResponse["homeLayout"],
        watermarkEnabledByDefault: config.watermarkEnabledByDefault,
        watermarkText: config.watermarkText,
        watermarkPosition:
          config.watermarkPosition as SiteResponse["watermarkPosition"],
        uploadOriginalEnabled: config.uploadOriginalEnabled,
        maxTotalPhotos: config.maxTotalPhotos,
        maxTagPoolSize: config.maxTagPoolSize,
        maxUploadFiles: config.maxUploadFiles,
        maxTagsPerPhoto: config.maxTagsPerPhoto,
        photoMetadataEnabled: config.photoMetadataEnabled,
        showDateInfo: config.showDateInfo,
        showCameraInfo: config.showCameraInfo,
        showImageInfo: config.showImageInfo,
        showAdvancedCameraInfo: config.showAdvancedCameraInfo,
        showLocationInfo: config.showLocationInfo,
        showDetailedExifInfo: config.showDetailedExifInfo,
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
      };
    },
    async getTagNames() {
      const tags = await getTagPool(env);
      return tags.map((tag) => tag.name);
    },
  };

  if (url.pathname === "/api/site/tags" && request.method === "GET") {
    return json(await getPublicSiteTags(reader));
  }

  if (request.method === "PATCH") {
    return handleSiteUpdate(request, env);
  }

  return json(await getPublicSite(reader));
}

async function handleSiteUpdate(request: Request, env: Env): Promise<Response> {
  let body: SiteUpdateBody;

  try {
    body = await readSiteUpdateBody(request);
  } catch {
    return json(
      {
        ok: false,
        error: getLocaleMessages("zh-CN").invalidRequestBody,
      },
      { status: 400 },
    );
  }

  try {
    const currentConfig = await getSiteConfig(env);
    const locale = normalizeLocale(
      typeof body.locale === "string" ? body.locale : currentConfig.locale,
    );
    const t = getLocaleMessages(locale);

    const updates: {
      locale?: string;
      siteTitle?: string;
      siteDescription?: string;
      homeLayout?: string;
      watermarkEnabledByDefault?: boolean;
      watermarkText?: string;
      watermarkPosition?: string;
      adminPassword?: string;
      uploadOriginalEnabled?: boolean;
      maxTotalPhotos?: number;
      maxTagPoolSize?: number;
      maxUploadFiles?: number;
      maxTagsPerPhoto?: number;
      photoMetadataEnabled?: boolean;
      showDateInfo?: boolean;
      showCameraInfo?: boolean;
      showImageInfo?: boolean;
      showAdvancedCameraInfo?: boolean;
      showLocationInfo?: boolean;
      showDetailedExifInfo?: boolean;
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

    if (body.locale !== undefined) {
      if (
        typeof body.locale !== "string" ||
        !["zh-CN", "zh-TW", "en"].includes(body.locale)
      ) {
        errors.push(t.invalidLanguage);
      } else {
        updates.locale = body.locale;
      }
    }

    if (body.siteTitle !== undefined) {
      if (
        typeof body.siteTitle !== "string" ||
        body.siteTitle.trim().length === 0
      ) {
        errors.push(t.siteTitleRequired);
      } else {
        const result = validateTextField(
          body.siteTitle,
          TEXT_LIMITS.siteTitle,
          t.siteTitleRequired,
          t.siteTitleTooLong(TEXT_LIMITS.siteTitle),
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
        errors.push(t.siteDescriptionInvalid);
      } else {
        const result = validateTextField(
          body.siteDescription,
          TEXT_LIMITS.siteDescription,
          t.siteDescriptionInvalid,
          t.siteDescriptionTooLong(TEXT_LIMITS.siteDescription),
          { allowEmpty: true },
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.siteDescription = result.value;
        }
      }
    }

    if (body.homeLayout !== undefined) {
      if (
        typeof body.homeLayout !== "string" ||
        !["masonry", "editorial", "spotlight"].includes(body.homeLayout)
      ) {
        errors.push(t.invalidHomeLayout);
      } else {
        updates.homeLayout = body.homeLayout;
      }
    }

    if (body.watermarkEnabledByDefault !== undefined) {
      if (typeof body.watermarkEnabledByDefault !== "boolean") {
        errors.push(t.invalidWatermarkDefault);
      } else {
        updates.watermarkEnabledByDefault = body.watermarkEnabledByDefault;
      }
    }

    if (body.watermarkText !== undefined) {
      if (
        typeof body.watermarkText !== "string" ||
        body.watermarkText.trim().length === 0
      ) {
        errors.push(t.watermarkTextRequired);
      } else {
        const result = validateTextField(
          body.watermarkText,
          TEXT_LIMITS.watermarkText,
          t.watermarkTextRequired,
          t.watermarkTextTooLong(TEXT_LIMITS.watermarkText),
        );

        if (!result.ok) {
          errors.push(result.error);
        } else {
          updates.watermarkText = result.value;
        }
      }
    }

    if (body.watermarkPosition !== undefined) {
      if (
        typeof body.watermarkPosition !== "string" ||
        ![
          "top-left",
          "top",
          "top-right",
          "left",
          "center",
          "right",
          "bottom-left",
          "bottom",
          "bottom-right",
        ].includes(body.watermarkPosition)
      ) {
        errors.push(t.invalidWatermarkPosition);
      } else {
        updates.watermarkPosition = body.watermarkPosition;
      }
    }

    if (body.adminPassword !== undefined) {
      if (
        typeof body.adminPassword !== "string" ||
        body.adminPassword.length < 6
      ) {
        errors.push(t.adminPasswordTooShort);
      } else if (!isWithinTextLimit(body.adminPassword, TEXT_LIMITS.password)) {
        errors.push(t.adminPasswordTooLong(TEXT_LIMITS.password));
      } else {
        updates.adminPassword = body.adminPassword;
      }
    }

    if (body.uploadOriginalEnabled !== undefined) {
      if (typeof body.uploadOriginalEnabled !== "boolean") {
        errors.push(t.invalidOriginalUploadSwitch);
      } else {
        updates.uploadOriginalEnabled = body.uploadOriginalEnabled;
      }
    }

    if (body.maxTagPoolSize !== undefined) {
      if (!Number.isInteger(body.maxTagPoolSize) || body.maxTagPoolSize <= 0) {
        errors.push(t.invalidMaxTagPoolSize);
      } else {
        updates.maxTagPoolSize = body.maxTagPoolSize;
      }
    }

    if (body.maxTotalPhotos !== undefined) {
      if (!Number.isInteger(body.maxTotalPhotos) || body.maxTotalPhotos <= 0) {
        errors.push(t.invalidMaxTotalPhotos);
      } else {
        updates.maxTotalPhotos = body.maxTotalPhotos;
      }
    }

    if (body.maxUploadFiles !== undefined) {
      if (!Number.isInteger(body.maxUploadFiles) || body.maxUploadFiles <= 0) {
        errors.push(t.invalidMaxUploadFiles);
      } else {
        updates.maxUploadFiles = body.maxUploadFiles;
      }
    }

    if (body.maxTagsPerPhoto !== undefined) {
      if (
        !Number.isInteger(body.maxTagsPerPhoto) ||
        body.maxTagsPerPhoto <= 0
      ) {
        errors.push(t.invalidMaxTagsPerPhoto);
      } else {
        updates.maxTagsPerPhoto = body.maxTagsPerPhoto;
      }
    }

    if (body.photoMetadataEnabled !== undefined) {
      if (typeof body.photoMetadataEnabled !== "boolean") {
        errors.push(t.invalidPhotoMetadataSwitch);
      } else {
        updates.photoMetadataEnabled = body.photoMetadataEnabled;
      }
    }

    if (body.showDateInfo !== undefined) {
      if (typeof body.showDateInfo !== "boolean") {
        errors.push(t.invalidShowDateInfo);
      } else {
        updates.showDateInfo = body.showDateInfo;
      }
    }

    if (body.showCameraInfo !== undefined) {
      if (typeof body.showCameraInfo !== "boolean") {
        errors.push(t.invalidShowCameraInfo);
      } else {
        updates.showCameraInfo = body.showCameraInfo;
      }
    }

    if (body.showImageInfo !== undefined) {
      if (typeof body.showImageInfo !== "boolean") {
        errors.push(t.invalidShowImageInfo);
      } else {
        updates.showImageInfo = body.showImageInfo;
      }
    }

    if (body.showAdvancedCameraInfo !== undefined) {
      if (typeof body.showAdvancedCameraInfo !== "boolean") {
        errors.push(t.invalidShowAdvancedCameraInfo);
      } else {
        updates.showAdvancedCameraInfo = body.showAdvancedCameraInfo;
      }
    }

    if (body.showLocationInfo !== undefined) {
      if (typeof body.showLocationInfo !== "boolean") {
        errors.push(t.invalidShowLocationInfo);
      } else {
        updates.showLocationInfo = body.showLocationInfo;
      }
    }

    if (body.showDetailedExifInfo !== undefined) {
      if (typeof body.showDetailedExifInfo !== "boolean") {
        errors.push(t.invalidShowDetailedExifInfo);
      } else {
        updates.showDetailedExifInfo = body.showDetailedExifInfo;
      }
    }

    if (body.photographerAvatarUrl !== undefined) {
      if (typeof body.photographerAvatarUrl !== "string") {
        errors.push(t.invalidPhotographerAvatarUrl);
      } else {
        const result = validateTextField(
          body.photographerAvatarUrl,
          TEXT_LIMITS.url,
          t.invalidPhotographerAvatarUrl,
          t.photographerAvatarUrlTooLong(TEXT_LIMITS.url),
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
        errors.push(t.invalidPhotographerName);
      } else {
        const result = validateTextField(
          body.photographerName,
          TEXT_LIMITS.photographerName,
          t.invalidPhotographerName,
          t.photographerNameTooLong(TEXT_LIMITS.photographerName),
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
        errors.push(t.invalidPhotographerBio);
      } else {
        const result = validateTextField(
          body.photographerBio,
          TEXT_LIMITS.photographerBio,
          t.invalidPhotographerBio,
          t.photographerBioTooLong(TEXT_LIMITS.photographerBio),
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
        errors.push(t.invalidPhotographerEmail);
      } else {
        const result = validateTextField(
          body.photographerEmail,
          TEXT_LIMITS.email,
          t.invalidPhotographerEmail,
          t.photographerEmailTooLong(TEXT_LIMITS.email),
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
        errors.push(t.invalidXiaohongshuAccount);
      } else {
        const result = validateTextField(
          body.photographerXiaohongshu,
          TEXT_LIMITS.accountName,
          t.invalidXiaohongshuAccount,
          t.xiaohongshuAccountTooLong(TEXT_LIMITS.accountName),
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
        errors.push(t.invalidXiaohongshuUrl);
      } else {
        const result = validateTextField(
          body.photographerXiaohongshuUrl,
          TEXT_LIMITS.url,
          t.invalidXiaohongshuUrl,
          t.xiaohongshuUrlTooLong(TEXT_LIMITS.url),
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
        errors.push(t.invalidDouyinAccount);
      } else {
        const result = validateTextField(
          body.photographerDouyin,
          TEXT_LIMITS.accountName,
          t.invalidDouyinAccount,
          t.douyinAccountTooLong(TEXT_LIMITS.accountName),
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
        errors.push(t.invalidDouyinUrl);
      } else {
        const result = validateTextField(
          body.photographerDouyinUrl,
          TEXT_LIMITS.url,
          t.invalidDouyinUrl,
          t.douyinUrlTooLong(TEXT_LIMITS.url),
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
        errors.push(t.invalidInstagramAccount);
      } else {
        const result = validateTextField(
          body.photographerInstagram,
          TEXT_LIMITS.accountName,
          t.invalidInstagramAccount,
          t.instagramAccountTooLong(TEXT_LIMITS.accountName),
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
        errors.push(t.invalidInstagramUrl);
      } else {
        const result = validateTextField(
          body.photographerInstagramUrl,
          TEXT_LIMITS.url,
          t.invalidInstagramUrl,
          t.instagramUrlTooLong(TEXT_LIMITS.url),
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
        errors.push(t.invalidCustomAccount);
      } else {
        const result = validateTextField(
          body.photographerCustomAccount,
          TEXT_LIMITS.accountName,
          t.invalidCustomAccount,
          t.customAccountTooLong(TEXT_LIMITS.accountName),
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
        errors.push(t.invalidCustomAccountUrl);
      } else {
        const result = validateTextField(
          body.photographerCustomAccountUrl,
          TEXT_LIMITS.url,
          t.invalidCustomAccountUrl,
          t.customAccountUrlTooLong(TEXT_LIMITS.url),
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
          error: result.error ?? t.saveSettingsFailed,
        },
        { status: 400 },
      );
    }

    return json({
      ok: true,
      message: t.settingsUpdated,
    });
  } catch (error) {
    console.error("Failed to update site config", error);

    return json(
      {
        ok: false,
        error: getLocaleMessages("zh-CN").saveSettingsFailed,
      },
      { status: 400 },
    );
  }
}
