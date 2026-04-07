export const DEFAULT_SITE_DESCRIPTION = "A lightweight home for photography that lets the work breathe.";
export const DEFAULT_UPLOAD_ORIGINAL_ENABLED = false;
export const DEFAULT_MAX_TAG_POOL_SIZE = 20;
export const DEFAULT_MAX_UPLOAD_FILES = 20;
export const DEFAULT_MAX_TAGS_PER_PHOTO = 5;
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
let ensureSiteConfigPromise = null;
function sanitizePositiveInt(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
}
function buildDefaultSiteConfig(env) {
    return {
        siteTitle: env.SITE_TITLE,
        siteDescription: DEFAULT_SITE_DESCRIPTION,
        watermarkEnabledByDefault: env.WATERMARK_ENABLED_BY_DEFAULT === "true",
        watermarkText: env.WATERMARK_TEXT,
        adminPassword: env.ADMIN_PASSWORD,
        uploadOriginalEnabled: DEFAULT_UPLOAD_ORIGINAL_ENABLED,
        maxTagPoolSize: DEFAULT_MAX_TAG_POOL_SIZE,
        maxUploadFiles: DEFAULT_MAX_UPLOAD_FILES,
        maxTagsPerPhoto: DEFAULT_MAX_TAGS_PER_PHOTO,
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
async function ensureSiteConfig(env) {
    if (!env.DB) {
        return;
    }
    if (!ensureSiteConfigPromise) {
        ensureSiteConfigPromise = (async () => {
            const defaults = buildDefaultSiteConfig(env);
            await env
                .DB.prepare(`CREATE TABLE IF NOT EXISTS site_config (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          site_title TEXT NOT NULL,
          site_description TEXT NOT NULL,
          watermark_enabled_by_default INTEGER NOT NULL DEFAULT 1,
          watermark_text TEXT NOT NULL,
          admin_password TEXT NOT NULL,
          upload_original_enabled INTEGER NOT NULL DEFAULT 0,
          max_tag_pool_size INTEGER NOT NULL DEFAULT 20,
          max_upload_files INTEGER NOT NULL DEFAULT 20,
          max_tags_per_photo INTEGER NOT NULL DEFAULT 5,
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
        )`)
                .run();
            const alterStatements = [
                "ALTER TABLE site_config ADD COLUMN photographer_avatar_url TEXT NOT NULL DEFAULT ''",
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
                    await env.DB.prepare(statement).run();
                }
                catch {
                    // Existing databases may already include the column.
                }
            }
            await env
                .DB.prepare(`INSERT OR IGNORE INTO site_config (
          id,
          site_title,
          site_description,
          watermark_enabled_by_default,
          watermark_text,
          admin_password,
          upload_original_enabled,
          max_tag_pool_size,
          max_upload_files,
          max_tags_per_photo,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .bind(1, defaults.siteTitle, defaults.siteDescription, defaults.watermarkEnabledByDefault ? 1 : 0, defaults.watermarkText, defaults.adminPassword, defaults.uploadOriginalEnabled ? 1 : 0, defaults.maxTagPoolSize, defaults.maxUploadFiles, defaults.maxTagsPerPhoto, defaults.photographerAvatarUrl, defaults.photographerName, defaults.photographerBio, defaults.photographerEmail, defaults.photographerXiaohongshu, defaults.photographerXiaohongshuUrl, defaults.photographerDouyin, defaults.photographerDouyinUrl, defaults.photographerInstagram, defaults.photographerInstagramUrl, defaults.photographerCustomAccount, defaults.photographerCustomAccountUrl, new Date().toISOString())
                .run();
        })().catch((error) => {
            ensureSiteConfigPromise = null;
            throw error;
        });
    }
    await ensureSiteConfigPromise;
}
function isMissingColumnError(error) {
    return error instanceof Error && error.message.includes("no such column");
}
function isMissingTableError(error) {
    return error instanceof Error && error.message.includes("no such table");
}
function mapSiteConfigRowToConfig(env, row) {
    const defaults = buildDefaultSiteConfig(env);
    if (!row) {
        return defaults;
    }
    return {
        siteTitle: row.site_title ?? defaults.siteTitle,
        siteDescription: row.site_description ?? defaults.siteDescription,
        watermarkEnabledByDefault: row.watermark_enabled_by_default !== undefined
            ? Boolean(row.watermark_enabled_by_default)
            : defaults.watermarkEnabledByDefault,
        watermarkText: row.watermark_text ?? defaults.watermarkText,
        adminPassword: row.admin_password ?? defaults.adminPassword,
        uploadOriginalEnabled: row.upload_original_enabled !== undefined
            ? Boolean(row.upload_original_enabled)
            : defaults.uploadOriginalEnabled,
        maxTagPoolSize: sanitizePositiveInt(row.max_tag_pool_size ?? defaults.maxTagPoolSize, defaults.maxTagPoolSize),
        maxUploadFiles: sanitizePositiveInt(row.max_upload_files ?? defaults.maxUploadFiles, defaults.maxUploadFiles),
        maxTagsPerPhoto: sanitizePositiveInt(row.max_tags_per_photo ?? defaults.maxTagsPerPhoto, defaults.maxTagsPerPhoto),
        photographerAvatarUrl: row.photographer_avatar_url ?? defaults.photographerAvatarUrl,
        photographerName: row.photographer_name ?? defaults.photographerName,
        photographerBio: row.photographer_bio ?? defaults.photographerBio,
        photographerEmail: row.photographer_email ?? defaults.photographerEmail,
        photographerXiaohongshu: row.photographer_xiaohongshu ?? defaults.photographerXiaohongshu,
        photographerXiaohongshuUrl: row.photographer_xiaohongshu_url ?? defaults.photographerXiaohongshuUrl,
        photographerDouyin: row.photographer_douyin ?? defaults.photographerDouyin,
        photographerDouyinUrl: row.photographer_douyin_url ?? defaults.photographerDouyinUrl,
        photographerInstagram: row.photographer_instagram ?? defaults.photographerInstagram,
        photographerInstagramUrl: row.photographer_instagram_url ?? defaults.photographerInstagramUrl,
        photographerCustomAccount: row.photographer_custom_account ?? defaults.photographerCustomAccount,
        photographerCustomAccountUrl: row.photographer_custom_account_url ??
            defaults.photographerCustomAccountUrl,
    };
}
export async function getSiteConfig(env) {
    const defaults = buildDefaultSiteConfig(env);
    if (!env.DB) {
        return defaults;
    }
    try {
        const row = await env.DB.prepare(`SELECT
        site_title,
        site_description,
        watermark_enabled_by_default,
        watermark_text,
        admin_password,
        upload_original_enabled,
        max_tag_pool_size,
        max_upload_files,
        max_tags_per_photo,
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
       LIMIT 1`).first();
        return mapSiteConfigRowToConfig(env, row);
    }
    catch (error) {
        if (!isMissingColumnError(error) && !isMissingTableError(error)) {
            return defaults;
        }
    }
    try {
        const legacyRow = await env.DB.prepare(`SELECT
        site_title,
        site_description,
        watermark_enabled_by_default,
        watermark_text,
        admin_password,
        upload_original_enabled,
        max_tag_pool_size,
        max_upload_files,
        max_tags_per_photo
       FROM site_config
       WHERE id = 1
       LIMIT 1`).first();
        return mapSiteConfigRowToConfig(env, legacyRow);
    }
    catch {
        return defaults;
    }
}
export async function getAdminPassword(env) {
    try {
        const config = await getSiteConfig(env);
        return config.adminPassword;
    }
    catch {
        return env.ADMIN_PASSWORD;
    }
}
export async function updateSiteConfig(env, updates) {
    if (!env.DB) {
        return {
            ok: false,
            error: "当前环境未绑定 D1，无法保存配置。",
        };
    }
    await ensureSiteConfig(env);
    const statements = [];
    const values = [];
    if (updates.siteTitle !== undefined) {
        statements.push("site_title = ?");
        values.push(updates.siteTitle);
    }
    if (updates.siteDescription !== undefined) {
        statements.push("site_description = ?");
        values.push(updates.siteDescription);
    }
    if (updates.watermarkEnabledByDefault !== undefined) {
        statements.push("watermark_enabled_by_default = ?");
        values.push(updates.watermarkEnabledByDefault ? 1 : 0);
    }
    if (updates.watermarkText !== undefined) {
        statements.push("watermark_text = ?");
        values.push(updates.watermarkText);
    }
    if (updates.adminPassword !== undefined) {
        statements.push("admin_password = ?");
        values.push(updates.adminPassword);
    }
    if (updates.uploadOriginalEnabled !== undefined) {
        statements.push("upload_original_enabled = ?");
        values.push(updates.uploadOriginalEnabled ? 1 : 0);
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
    await env.DB.prepare(`UPDATE site_config SET ${statements.join(", ")} WHERE id = ?`)
        .bind(...values)
        .run();
    return { ok: true };
}
