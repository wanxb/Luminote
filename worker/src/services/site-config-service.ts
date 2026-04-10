import type { Env } from "../index";

export const DEFAULT_SITE_DESCRIPTION =
  "A lightweight home for photography that lets the work breathe.";
export const DEFAULT_SITE_LOCALE = "zh-CN";
export const DEFAULT_UPLOAD_ORIGINAL_ENABLED = false;
export const DEFAULT_MAX_TOTAL_PHOTOS = 200;
export const DEFAULT_MAX_TAG_POOL_SIZE = 20;
export const DEFAULT_MAX_UPLOAD_FILES = 20;
export const DEFAULT_MAX_TAGS_PER_PHOTO = 5;
export const DEFAULT_HOME_LAYOUT = "editorial";
export const DEFAULT_WATERMARK_POSITION = "bottom-right";
export const DEFAULT_PHOTO_METADATA_ENABLED = true;
export const DEFAULT_SHOW_DATE_INFO = true;
export const DEFAULT_SHOW_CAMERA_INFO = true;
export const DEFAULT_SHOW_LOCATION_INFO = true;
export const DEFAULT_SHOW_DETAILED_EXIF_INFO = true;
export const DEFAULT_PHOTOGRAPHER_AVATAR_URL = "";
export const DEFAULT_PHOTOGRAPHER_NAME = "";
export const DEFAULT_PHOTOGRAPHER_BIO = "";
export const DEFAULT_PHOTOGRAPHER_EMAIL = "";
export const DEFAULT_PHOTOGRAPHER_XIAOHONGSHU = "";
export const DEFAULT_PHOTOGRAPHER_XIAOHONGSHU_URL = "";
export const DEFAULT_PHOTOGRAPHER_DOUYIN = "";
export const DEFAULT_PHOTOGRAPHER_DOUYIN_URL = "";
export const DEFAULT_PHOTOGRAPHER_INSTAGRAM = "";
export const DEFAULT_PHOTOGRAPHER_INSTAGRAM_URL = "";
export const DEFAULT_PHOTOGRAPHER_CUSTOM_ACCOUNT = "";
export const DEFAULT_PHOTOGRAPHER_CUSTOM_ACCOUNT_URL = "";

type SiteConfigRow = {
  locale: string;
  site_title: string;
  site_description: string;
  home_layout: string;
  watermark_enabled_by_default: number;
  watermark_text: string;
  watermark_position: string;
  admin_password: string;
  upload_original_enabled: number;
  max_total_photos: number;
  max_tag_pool_size: number;
  max_upload_files: number;
  max_tags_per_photo: number;
  photo_metadata_enabled: number;
  show_date_info: number;
  show_camera_info: number;
  show_location_info: number;
  show_detailed_exif_info: number;
  photographer_avatar_url: string;
  photographer_name: string;
  photographer_bio: string;
  photographer_email: string;
  photographer_xiaohongshu: string;
  photographer_xiaohongshu_url: string;
  photographer_douyin: string;
  photographer_douyin_url: string;
  photographer_instagram: string;
  photographer_instagram_url: string;
  photographer_custom_account: string;
  photographer_custom_account_url: string;
};

export type SiteConfig = {
  locale: string;
  siteTitle: string;
  siteDescription: string;
  homeLayout: string;
  watermarkEnabledByDefault: boolean;
  watermarkText: string;
  watermarkPosition: string;
  adminPassword: string;
  uploadOriginalEnabled: boolean;
  maxTotalPhotos: number;
  maxTagPoolSize: number;
  maxUploadFiles: number;
  maxTagsPerPhoto: number;
  photoMetadataEnabled: boolean;
  showDateInfo: boolean;
  showCameraInfo: boolean;
  showLocationInfo: boolean;
  showDetailedExifInfo: boolean;
  photographerAvatarUrl: string;
  photographerName: string;
  photographerBio: string;
  photographerEmail: string;
  photographerXiaohongshu: string;
  photographerXiaohongshuUrl: string;
  photographerDouyin: string;
  photographerDouyinUrl: string;
  photographerInstagram: string;
  photographerInstagramUrl: string;
  photographerCustomAccount: string;
  photographerCustomAccountUrl: string;
};

let ensureSiteConfigPromise: Promise<void> | null = null;

type LegacySiteConfigRow = {
  locale?: string;
  site_title: string;
  site_description: string;
  home_layout?: string;
  watermark_enabled_by_default: number;
  watermark_text: string;
  watermark_position?: string;
  admin_password: string;
  upload_original_enabled?: number;
  max_total_photos?: number;
  max_tag_pool_size?: number;
  max_upload_files?: number;
  max_tags_per_photo?: number;
  photo_metadata_enabled?: number;
  show_date_info?: number;
  show_camera_info?: number;
  show_location_info?: number;
  show_detailed_exif_info?: number;
};

function sanitizePositiveInt(value: number, fallback: number) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function buildDefaultSiteConfig(env: Env): SiteConfig {
  return {
    locale: DEFAULT_SITE_LOCALE,
    siteTitle: env.SITE_TITLE,
    siteDescription: DEFAULT_SITE_DESCRIPTION,
    homeLayout: DEFAULT_HOME_LAYOUT,
    watermarkEnabledByDefault: env.WATERMARK_ENABLED_BY_DEFAULT === "true",
    watermarkText: env.WATERMARK_TEXT,
    watermarkPosition: DEFAULT_WATERMARK_POSITION,
    adminPassword: env.ADMIN_PASSWORD,
    uploadOriginalEnabled: DEFAULT_UPLOAD_ORIGINAL_ENABLED,
    maxTotalPhotos: DEFAULT_MAX_TOTAL_PHOTOS,
    maxTagPoolSize: DEFAULT_MAX_TAG_POOL_SIZE,
    maxUploadFiles: DEFAULT_MAX_UPLOAD_FILES,
    maxTagsPerPhoto: DEFAULT_MAX_TAGS_PER_PHOTO,
    photoMetadataEnabled: DEFAULT_PHOTO_METADATA_ENABLED,
    showDateInfo: DEFAULT_SHOW_DATE_INFO,
    showCameraInfo: DEFAULT_SHOW_CAMERA_INFO,
    showLocationInfo: DEFAULT_SHOW_LOCATION_INFO,
    showDetailedExifInfo: DEFAULT_SHOW_DETAILED_EXIF_INFO,
    photographerAvatarUrl: DEFAULT_PHOTOGRAPHER_AVATAR_URL,
    photographerName: DEFAULT_PHOTOGRAPHER_NAME,
    photographerBio: DEFAULT_PHOTOGRAPHER_BIO,
    photographerEmail: DEFAULT_PHOTOGRAPHER_EMAIL,
    photographerXiaohongshu: DEFAULT_PHOTOGRAPHER_XIAOHONGSHU,
    photographerXiaohongshuUrl: DEFAULT_PHOTOGRAPHER_XIAOHONGSHU_URL,
    photographerDouyin: DEFAULT_PHOTOGRAPHER_DOUYIN,
    photographerDouyinUrl: DEFAULT_PHOTOGRAPHER_DOUYIN_URL,
    photographerInstagram: DEFAULT_PHOTOGRAPHER_INSTAGRAM,
    photographerInstagramUrl: DEFAULT_PHOTOGRAPHER_INSTAGRAM_URL,
    photographerCustomAccount: DEFAULT_PHOTOGRAPHER_CUSTOM_ACCOUNT,
    photographerCustomAccountUrl: DEFAULT_PHOTOGRAPHER_CUSTOM_ACCOUNT_URL,
  };
}

async function ensureSiteConfig(env: Env) {
  if (!env.DB) {
    return;
  }

  if (!ensureSiteConfigPromise) {
    ensureSiteConfigPromise = (async () => {
      const defaults = buildDefaultSiteConfig(env);

      await env
        .DB!.prepare(
          `CREATE TABLE IF NOT EXISTS site_config (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          locale TEXT NOT NULL DEFAULT 'zh-CN',
          site_title TEXT NOT NULL,
          site_description TEXT NOT NULL,
          home_layout TEXT NOT NULL DEFAULT 'editorial',
          watermark_enabled_by_default INTEGER NOT NULL DEFAULT 1,
          watermark_text TEXT NOT NULL,
          watermark_position TEXT NOT NULL DEFAULT 'bottom-right',
          admin_password TEXT NOT NULL,
          upload_original_enabled INTEGER NOT NULL DEFAULT 0,
          max_total_photos INTEGER NOT NULL DEFAULT 200,
          max_tag_pool_size INTEGER NOT NULL DEFAULT 20,
          max_upload_files INTEGER NOT NULL DEFAULT 20,
          max_tags_per_photo INTEGER NOT NULL DEFAULT 5,
          photo_metadata_enabled INTEGER NOT NULL DEFAULT 1,
          show_date_info INTEGER NOT NULL DEFAULT 1,
          show_camera_info INTEGER NOT NULL DEFAULT 1,
          show_location_info INTEGER NOT NULL DEFAULT 1,
          show_detailed_exif_info INTEGER NOT NULL DEFAULT 1,
          photographer_avatar_url TEXT NOT NULL DEFAULT '',
          photographer_name TEXT NOT NULL DEFAULT '',
          photographer_bio TEXT NOT NULL DEFAULT '',
          photographer_email TEXT NOT NULL DEFAULT '',
          photographer_xiaohongshu TEXT NOT NULL DEFAULT '',
          photographer_xiaohongshu_url TEXT NOT NULL DEFAULT '',
          photographer_douyin TEXT NOT NULL DEFAULT '',
          photographer_douyin_url TEXT NOT NULL DEFAULT '',
          photographer_instagram TEXT NOT NULL DEFAULT '',
          photographer_instagram_url TEXT NOT NULL DEFAULT '',
          photographer_custom_account TEXT NOT NULL DEFAULT '',
          photographer_custom_account_url TEXT NOT NULL DEFAULT '',
          updated_at TEXT NOT NULL
        )`,
        )
        .run();

      const alterStatements = [
        "ALTER TABLE site_config ADD COLUMN home_layout TEXT NOT NULL DEFAULT 'editorial'",
        "ALTER TABLE site_config ADD COLUMN locale TEXT NOT NULL DEFAULT 'zh-CN'",
        "ALTER TABLE site_config ADD COLUMN photographer_avatar_url TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN watermark_position TEXT NOT NULL DEFAULT 'bottom-right'",
        "ALTER TABLE site_config ADD COLUMN max_total_photos INTEGER NOT NULL DEFAULT 200",
        "ALTER TABLE site_config ADD COLUMN photo_metadata_enabled INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE site_config ADD COLUMN show_date_info INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE site_config ADD COLUMN show_camera_info INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE site_config ADD COLUMN show_location_info INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE site_config ADD COLUMN show_detailed_exif_info INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE site_config ADD COLUMN photographer_name TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_bio TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_email TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_xiaohongshu TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_xiaohongshu_url TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_douyin TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_douyin_url TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_instagram TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_instagram_url TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_custom_account TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE site_config ADD COLUMN photographer_custom_account_url TEXT NOT NULL DEFAULT ''",
      ];

      for (const statement of alterStatements) {
        try {
          await env.DB!.prepare(statement).run();
        } catch {
          // Existing databases may already include the column.
        }
      }

      await env
        .DB!.prepare(
          `INSERT OR IGNORE INTO site_config (
          id,
          locale,
          site_title,
          site_description,
          home_layout,
          watermark_enabled_by_default,
          watermark_text,
          watermark_position,
          admin_password,
          upload_original_enabled,
          max_total_photos,
          max_tag_pool_size,
          max_upload_files,
          max_tags_per_photo,
          photo_metadata_enabled,
          show_date_info,
          show_camera_info,
          show_location_info,
          show_detailed_exif_info,
          photographer_avatar_url,
          photographer_name,
          photographer_bio,
          photographer_email,
          photographer_xiaohongshu,
          photographer_xiaohongshu_url,
          photographer_douyin,
          photographer_douyin_url,
          photographer_instagram,
          photographer_instagram_url,
          photographer_custom_account,
          photographer_custom_account_url,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          1,
          defaults.locale,
          defaults.siteTitle,
          defaults.siteDescription,
          defaults.homeLayout,
          defaults.watermarkEnabledByDefault ? 1 : 0,
          defaults.watermarkText,
          defaults.watermarkPosition,
          defaults.adminPassword,
          defaults.uploadOriginalEnabled ? 1 : 0,
          defaults.maxTotalPhotos,
          defaults.maxTagPoolSize,
          defaults.maxUploadFiles,
          defaults.maxTagsPerPhoto,
          defaults.photoMetadataEnabled ? 1 : 0,
          defaults.showDateInfo ? 1 : 0,
          defaults.showCameraInfo ? 1 : 0,
          defaults.showLocationInfo ? 1 : 0,
          defaults.showDetailedExifInfo ? 1 : 0,
          defaults.photographerAvatarUrl,
          defaults.photographerName,
          defaults.photographerBio,
          defaults.photographerEmail,
          defaults.photographerXiaohongshu,
          defaults.photographerXiaohongshuUrl,
          defaults.photographerDouyin,
          defaults.photographerDouyinUrl,
          defaults.photographerInstagram,
          defaults.photographerInstagramUrl,
          defaults.photographerCustomAccount,
          defaults.photographerCustomAccountUrl,
          new Date().toISOString(),
        )
        .run();
    })().catch((error) => {
      ensureSiteConfigPromise = null;
      throw error;
    });
  }

  await ensureSiteConfigPromise;
}

function isMissingColumnError(error: unknown) {
  return error instanceof Error && error.message.includes("no such column");
}

function isMissingTableError(error: unknown) {
  return error instanceof Error && error.message.includes("no such table");
}

function mapSiteConfigRowToConfig(
  env: Env,
  row: Partial<SiteConfigRow> | null,
) {
  const defaults = buildDefaultSiteConfig(env);

  if (!row) {
    return defaults;
  }

  return {
    locale: row.locale ?? defaults.locale,
    siteTitle: row.site_title ?? defaults.siteTitle,
    siteDescription: row.site_description ?? defaults.siteDescription,
    homeLayout: row.home_layout ?? defaults.homeLayout,
    watermarkEnabledByDefault:
      row.watermark_enabled_by_default !== undefined
        ? Boolean(row.watermark_enabled_by_default)
        : defaults.watermarkEnabledByDefault,
    watermarkText: row.watermark_text ?? defaults.watermarkText,
    watermarkPosition: row.watermark_position ?? defaults.watermarkPosition,
    adminPassword: row.admin_password ?? defaults.adminPassword,
    uploadOriginalEnabled:
      row.upload_original_enabled !== undefined
        ? Boolean(row.upload_original_enabled)
        : defaults.uploadOriginalEnabled,
    maxTotalPhotos: sanitizePositiveInt(
      row.max_total_photos ?? defaults.maxTotalPhotos,
      defaults.maxTotalPhotos,
    ),
    maxTagPoolSize: sanitizePositiveInt(
      row.max_tag_pool_size ?? defaults.maxTagPoolSize,
      defaults.maxTagPoolSize,
    ),
    maxUploadFiles: sanitizePositiveInt(
      row.max_upload_files ?? defaults.maxUploadFiles,
      defaults.maxUploadFiles,
    ),
    maxTagsPerPhoto: sanitizePositiveInt(
      row.max_tags_per_photo ?? defaults.maxTagsPerPhoto,
      defaults.maxTagsPerPhoto,
    ),
    photoMetadataEnabled:
      row.photo_metadata_enabled !== undefined
        ? Boolean(row.photo_metadata_enabled)
        : defaults.photoMetadataEnabled,
    showDateInfo:
      row.show_date_info !== undefined
        ? Boolean(row.show_date_info)
        : defaults.showDateInfo,
    showCameraInfo:
      row.show_camera_info !== undefined
        ? Boolean(row.show_camera_info)
        : defaults.showCameraInfo,
    showLocationInfo:
      row.show_location_info !== undefined
        ? Boolean(row.show_location_info)
        : defaults.showLocationInfo,
    showDetailedExifInfo:
      row.show_detailed_exif_info !== undefined
        ? Boolean(row.show_detailed_exif_info)
        : defaults.showDetailedExifInfo,
    photographerAvatarUrl:
      row.photographer_avatar_url ?? defaults.photographerAvatarUrl,
    photographerName: row.photographer_name ?? defaults.photographerName,
    photographerBio: row.photographer_bio ?? defaults.photographerBio,
    photographerEmail: row.photographer_email ?? defaults.photographerEmail,
    photographerXiaohongshu:
      row.photographer_xiaohongshu ?? defaults.photographerXiaohongshu,
    photographerXiaohongshuUrl:
      row.photographer_xiaohongshu_url ?? defaults.photographerXiaohongshuUrl,
    photographerDouyin: row.photographer_douyin ?? defaults.photographerDouyin,
    photographerDouyinUrl:
      row.photographer_douyin_url ?? defaults.photographerDouyinUrl,
    photographerInstagram:
      row.photographer_instagram ?? defaults.photographerInstagram,
    photographerInstagramUrl:
      row.photographer_instagram_url ?? defaults.photographerInstagramUrl,
    photographerCustomAccount:
      row.photographer_custom_account ?? defaults.photographerCustomAccount,
    photographerCustomAccountUrl:
      row.photographer_custom_account_url ??
      defaults.photographerCustomAccountUrl,
  };
}

export async function getSiteConfig(env: Env): Promise<SiteConfig> {
  const defaults = buildDefaultSiteConfig(env);

  if (!env.DB) {
    return defaults;
  }

  await ensureSiteConfig(env);

  try {
    const row = await env.DB.prepare(
      `SELECT
        site_title,
        locale,
        site_description,
        home_layout,
        watermark_enabled_by_default,
        watermark_text,
        watermark_position,
        admin_password,
        upload_original_enabled,
        max_total_photos,
        max_tag_pool_size,
        max_upload_files,
        max_tags_per_photo,
        photo_metadata_enabled,
        show_date_info,
        show_camera_info,
        show_location_info,
        show_detailed_exif_info,
        photographer_avatar_url,
        photographer_name,
        photographer_bio,
        photographer_email,
        photographer_xiaohongshu,
        photographer_xiaohongshu_url,
        photographer_douyin,
        photographer_douyin_url,
        photographer_instagram,
        photographer_instagram_url,
        photographer_custom_account,
        photographer_custom_account_url
       FROM site_config
       WHERE id = 1
       LIMIT 1`,
    ).first<SiteConfigRow>();

    return mapSiteConfigRowToConfig(env, row);
  } catch (error) {
    if (!isMissingColumnError(error) && !isMissingTableError(error)) {
      return defaults;
    }
  }

  try {
    const legacyRow = await env.DB.prepare(
      `SELECT
        site_title,
        locale,
        site_description,
        watermark_enabled_by_default,
        watermark_text,
        admin_password,
        upload_original_enabled,
        max_total_photos,
        max_tag_pool_size,
        max_upload_files,
        max_tags_per_photo
       FROM site_config
       WHERE id = 1
       LIMIT 1`,
    ).first<LegacySiteConfigRow>();

    return mapSiteConfigRowToConfig(
      env,
      legacyRow as Partial<SiteConfigRow> | null,
    );
  } catch {
    return defaults;
  }
}

export async function getAdminPassword(env: Env) {
  try {
    const config = await getSiteConfig(env);
    return config.adminPassword;
  } catch {
    return env.ADMIN_PASSWORD;
  }
}

export async function updateSiteConfig(
  env: Env,
  updates: Partial<Omit<SiteConfig, "adminPassword">> & {
    adminPassword?: string;
  },
) {
  if (!env.DB) {
    return {
      ok: false,
      error: "当前环境未绑定 D1，无法保存配置。",
    };
  }

  await ensureSiteConfig(env);

  const statements: string[] = [];
  const values: unknown[] = [];

  if (updates.siteTitle !== undefined) {
    statements.push("site_title = ?");
    values.push(updates.siteTitle);
  }

  if (updates.locale !== undefined) {
    statements.push("locale = ?");
    values.push(updates.locale);
  }

  if (updates.siteDescription !== undefined) {
    statements.push("site_description = ?");
    values.push(updates.siteDescription);
  }

  if (updates.homeLayout !== undefined) {
    statements.push("home_layout = ?");
    values.push(updates.homeLayout);
  }

  if (updates.watermarkEnabledByDefault !== undefined) {
    statements.push("watermark_enabled_by_default = ?");
    values.push(updates.watermarkEnabledByDefault ? 1 : 0);
  }

  if (updates.watermarkText !== undefined) {
    statements.push("watermark_text = ?");
    values.push(updates.watermarkText);
  }

  if (updates.watermarkPosition !== undefined) {
    statements.push("watermark_position = ?");
    values.push(updates.watermarkPosition);
  }

  if (updates.adminPassword !== undefined) {
    statements.push("admin_password = ?");
    values.push(updates.adminPassword);
  }

  if (updates.uploadOriginalEnabled !== undefined) {
    statements.push("upload_original_enabled = ?");
    values.push(updates.uploadOriginalEnabled ? 1 : 0);
  }

  if (updates.maxTotalPhotos !== undefined) {
    statements.push("max_total_photos = ?");
    values.push(updates.maxTotalPhotos);
  }

  if (updates.maxTagPoolSize !== undefined) {
    statements.push("max_tag_pool_size = ?");
    values.push(updates.maxTagPoolSize);
  }

  if (updates.maxUploadFiles !== undefined) {
    statements.push("max_upload_files = ?");
    values.push(updates.maxUploadFiles);
  }

  if (updates.maxTagsPerPhoto !== undefined) {
    statements.push("max_tags_per_photo = ?");
    values.push(updates.maxTagsPerPhoto);
  }

  if (updates.photoMetadataEnabled !== undefined) {
    statements.push("photo_metadata_enabled = ?");
    values.push(updates.photoMetadataEnabled ? 1 : 0);
  }

  if (updates.showDateInfo !== undefined) {
    statements.push("show_date_info = ?");
    values.push(updates.showDateInfo ? 1 : 0);
  }

  if (updates.showCameraInfo !== undefined) {
    statements.push("show_camera_info = ?");
    values.push(updates.showCameraInfo ? 1 : 0);
  }

  if (updates.showLocationInfo !== undefined) {
    statements.push("show_location_info = ?");
    values.push(updates.showLocationInfo ? 1 : 0);
  }

  if (updates.showDetailedExifInfo !== undefined) {
    statements.push("show_detailed_exif_info = ?");
    values.push(updates.showDetailedExifInfo ? 1 : 0);
  }

  if (updates.photographerAvatarUrl !== undefined) {
    statements.push("photographer_avatar_url = ?");
    values.push(updates.photographerAvatarUrl);
  }

  if (updates.photographerName !== undefined) {
    statements.push("photographer_name = ?");
    values.push(updates.photographerName);
  }

  if (updates.photographerBio !== undefined) {
    statements.push("photographer_bio = ?");
    values.push(updates.photographerBio);
  }

  if (updates.photographerEmail !== undefined) {
    statements.push("photographer_email = ?");
    values.push(updates.photographerEmail);
  }

  if (updates.photographerXiaohongshu !== undefined) {
    statements.push("photographer_xiaohongshu = ?");
    values.push(updates.photographerXiaohongshu);
  }

  if (updates.photographerXiaohongshuUrl !== undefined) {
    statements.push("photographer_xiaohongshu_url = ?");
    values.push(updates.photographerXiaohongshuUrl);
  }

  if (updates.photographerDouyin !== undefined) {
    statements.push("photographer_douyin = ?");
    values.push(updates.photographerDouyin);
  }

  if (updates.photographerDouyinUrl !== undefined) {
    statements.push("photographer_douyin_url = ?");
    values.push(updates.photographerDouyinUrl);
  }

  if (updates.photographerInstagram !== undefined) {
    statements.push("photographer_instagram = ?");
    values.push(updates.photographerInstagram);
  }

  if (updates.photographerInstagramUrl !== undefined) {
    statements.push("photographer_instagram_url = ?");
    values.push(updates.photographerInstagramUrl);
  }

  if (updates.photographerCustomAccount !== undefined) {
    statements.push("photographer_custom_account = ?");
    values.push(updates.photographerCustomAccount);
  }

  if (updates.photographerCustomAccountUrl !== undefined) {
    statements.push("photographer_custom_account_url = ?");
    values.push(updates.photographerCustomAccountUrl);
  }

  if (statements.length === 0) {
    return { ok: true };
  }

  statements.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(1);

  await env.DB.prepare(
    `UPDATE site_config SET ${statements.join(", ")} WHERE id = ?`,
  )
    .bind(...values)
    .run();

  return { ok: true };
}
