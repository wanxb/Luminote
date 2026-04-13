import { getSqliteDb } from "../db/sqlite.mjs";

function resolveAssetUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl).toString();
}

function buildSite(baseUrl, site) {
  return {
    ...site,
    photographerAvatarUrl: site.photographerAvatarUrl
      ? resolveAssetUrl(baseUrl, site.photographerAvatarUrl)
      : "",
  };
}

function buildPhotoSummary(baseUrl, row) {
  const tags = JSON.parse(row.tags_json || "[]");

  return {
    id: row.id,
    thumbUrl: resolveAssetUrl(baseUrl, row.thumb_url),
    displayUrl: resolveAssetUrl(baseUrl, row.display_url),
    watermarkedDisplayUrl: row.watermarked_display_url
      ? resolveAssetUrl(baseUrl, row.watermarked_display_url)
      : undefined,
    watermarkEnabled: Boolean(row.watermark_enabled),
    isHidden: Boolean(row.is_hidden),
    takenAt: row.taken_at || undefined,
    description: row.description || undefined,
    tags,
  };
}

function buildPhotoDetail(baseUrl, row) {
  return {
    ...buildPhotoSummary(baseUrl, row),
    device: row.device || undefined,
    lens: row.lens || undefined,
    location: row.location || undefined,
    exif: row.exif_json ? JSON.parse(row.exif_json) : undefined,
  };
}

export function createSqlitePublicContentRepository(config) {
  return {
    async getSite() {
      const db = await getSqliteDb(config);
      const row = db
        .prepare("SELECT site_json FROM site_config WHERE id = 1")
        .get();
      return buildSite(config.publicBaseUrl, JSON.parse(row.site_json));
    },

    async getTagNames() {
      const db = await getSqliteDb(config);
      return db
        .prepare("SELECT name FROM tag_pool ORDER BY created_at ASC")
        .all()
        .map((row) => row.name);
    },

    async listPhotos({ tag, page, pageSize }) {
      const db = await getSqliteDb(config);
      const offset = (page - 1) * pageSize;
      const conditions = ["is_hidden = 0"];
      const values = [];

      if (tag) {
        conditions.push(
          "EXISTS (SELECT 1 FROM json_each(COALESCE(tags_json, '[]')) WHERE value = ?)",
        );
        values.push(tag);
      }

      const whereClause = `WHERE ${conditions.join(" AND ")}`;
      const rows = db
        .prepare(
          `SELECT * FROM photos ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        )
        .all(...values, pageSize, offset);
      const totalRow = db
        .prepare(`SELECT COUNT(*) AS count FROM photos ${whereClause}`)
        .get(...values);

      return {
        items: rows.map((row) => buildPhotoSummary(config.publicBaseUrl, row)),
        hasMore: offset + pageSize < (totalRow?.count || 0),
        total: totalRow?.count || 0,
      };
    },

    async getPhotoDetail(id) {
      const db = await getSqliteDb(config);
      const row = db
        .prepare("SELECT * FROM photos WHERE id = ? LIMIT 1")
        .get(id);

      if (!row || row.is_hidden) {
        return null;
      }

      return buildPhotoDetail(config.publicBaseUrl, row);
    },
  };
}
