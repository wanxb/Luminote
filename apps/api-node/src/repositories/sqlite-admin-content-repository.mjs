import { getSqliteDb } from "../db/sqlite.mjs";
import {
  validatePhotoDescription,
  validatePhotoTags,
  validateSitePatch,
  validateTagName,
} from "../domain/validation.mjs";

function uniqueTags(tags) {
  return Array.from(
    new Set(
      (Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag).trim())
        .filter(Boolean),
    ),
  );
}

function resolveAssetUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl).toString();
}

export function createSqliteAdminContentRepository(config) {
  return {
    async getSiteSettings() {
      const db = await getSqliteDb(config);
      const row = db.prepare("SELECT site_json FROM site_config WHERE id = 1").get();
      return JSON.parse(row.site_json);
    },

    async listTags() {
      const db = await getSqliteDb(config);
      return db
        .prepare("SELECT id, name, created_at AS createdAt FROM tag_pool ORDER BY created_at ASC")
        .all();
    },

    async createPhoto(input) {
      const db = await getSqliteDb(config);
      const site = await this.getSiteSettings();
      const normalizedSourceHash = input.sourceHash?.trim();

      if (normalizedSourceHash) {
        const existing = db
          .prepare("SELECT id FROM photos WHERE source_hash = ? LIMIT 1")
          .get(normalizedSourceHash);

        if (existing) {
          throw new Error("Duplicate photo content detected.");
        }
      }

      const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      validatePhotoDescription(input.description || "");
      const tags = validatePhotoTags(
        input.tags || [],
        site.maxTagsPerPhoto || 5,
      );

      db.prepare(`
        INSERT INTO photos (
          id,
          thumb_url,
          display_url,
          watermarked_display_url,
          watermark_enabled,
          is_hidden,
          taken_at,
          description,
          tags_json,
          source_hash,
          device,
          lens,
          location,
          exif_json,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        `/assets/thumb/${id}`,
        `/assets/display/${id}`,
        input.watermarkEnabled ? `/assets/display-watermarked/${id}` : null,
        input.watermarkEnabled ? 1 : 0,
        0,
        input.takenAt || null,
        input.description || "",
        JSON.stringify(tags),
        normalizedSourceHash || null,
        input.device || null,
        input.lens || null,
        input.location || null,
        input.exif ? JSON.stringify(input.exif) : null,
        input.takenAt || new Date().toISOString(),
      );

      return {
        id,
        fileName: input.fileName,
        watermarkEnabled: Boolean(input.watermarkEnabled),
        tags,
        persisted: true,
      };
    },

    async listAdminPhotos({ tag, page, pageSize }) {
      const db = await getSqliteDb(config);
      const offset = (page - 1) * pageSize;
      const values = [];
      let whereClause = "";

      if (tag) {
        whereClause = "WHERE tags_json LIKE ?";
        values.push(`%${tag}%`);
      }

      const rows = db
        .prepare(
          `SELECT * FROM photos ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        )
        .all(...values, pageSize, offset)
        .map((row) => ({
          id: row.id,
          thumbUrl: resolveAssetUrl(config.publicBaseUrl, row.thumb_url),
          displayUrl: resolveAssetUrl(config.publicBaseUrl, row.display_url),
          watermarkedDisplayUrl: row.watermarked_display_url
            ? resolveAssetUrl(config.publicBaseUrl, row.watermarked_display_url)
            : undefined,
          watermarkEnabled: Boolean(row.watermark_enabled),
          isHidden: Boolean(row.is_hidden),
          takenAt: row.taken_at || undefined,
          description: row.description || undefined,
          tags: JSON.parse(row.tags_json || "[]"),
        }));
      const total = db
        .prepare(`SELECT COUNT(*) AS count FROM photos ${whereClause}`)
        .get(...values)?.count || 0;
      const unfilteredTotal =
        db.prepare("SELECT COUNT(*) AS count FROM photos").get()?.count || 0;

      return {
        items: rows,
        hasMore: offset + pageSize < total,
        total,
        unfilteredTotal,
      };
    },

    async updatePhoto(id, updates) {
      const db = await getSqliteDb(config);
      const site = await this.getSiteSettings();
      const row = db.prepare("SELECT id, tags_json FROM photos WHERE id = ?").get(id);

      if (!row) {
        return { ok: false, persisted: true, error: "Photo not found." };
      }

      if (updates.description !== undefined) {
        validatePhotoDescription(updates.description);
      }

      const nextTags =
        updates.tags !== undefined
          ? JSON.stringify(validatePhotoTags(updates.tags, site.maxTagsPerPhoto || 5))
          : row.tags_json;

      db.prepare(`
        UPDATE photos
        SET description = COALESCE(?, description),
            is_hidden = COALESCE(?, is_hidden),
            tags_json = ?
        WHERE id = ?
      `).run(
        updates.description ?? null,
        updates.isHidden !== undefined ? (updates.isHidden ? 1 : 0) : null,
        nextTags,
        id,
      );

      return { ok: true, persisted: true };
    },

    async deletePhoto(id) {
      const db = await getSqliteDb(config);
      const existing = db.prepare("SELECT id FROM photos WHERE id = ?").get(id);

      if (!existing) {
        return {
          ok: false,
          deleted: false,
          persisted: true,
          error: "Photo not found or already deleted.",
        };
      }

      db.prepare("DELETE FROM photos WHERE id = ?").run(id);
      return { ok: true, deleted: true, persisted: true };
    },

    async updateSite(updates) {
      const db = await getSqliteDb(config);
      validateSitePatch(updates);
      const row = db.prepare("SELECT site_json FROM site_config WHERE id = 1").get();
      const nextSite = {
        ...JSON.parse(row.site_json),
        ...updates,
      };

      db.prepare("UPDATE site_config SET site_json = ? WHERE id = 1").run(
        JSON.stringify(nextSite),
      );

      return nextSite;
    },

    async createTag(name) {
      const db = await getSqliteDb(config);
      const normalized = validateTagName(name);
      const site = await this.getSiteSettings();
      const existing = db
        .prepare("SELECT id, name, created_at AS createdAt FROM tag_pool WHERE name = ?")
        .get(normalized);

      if (existing) {
        return existing;
      }

      const total = db.prepare("SELECT COUNT(*) AS count FROM tag_pool").get()?.count || 0;
      if (total >= (site.maxTagPoolSize || 20)) {
        throw new Error(`Tag pool limit reached: ${site.maxTagPoolSize || 20}.`);
      }

      const tag = {
        id: `tag_${normalized.toLowerCase().replace(/\s+/g, "_")}`,
        name: normalized,
        createdAt: new Date().toISOString(),
      };

      db.prepare("INSERT INTO tag_pool (id, name, created_at) VALUES (?, ?, ?)")
        .run(tag.id, tag.name, tag.createdAt);

      return tag;
    },

    async deleteTag(name) {
      const db = await getSqliteDb(config);
      const normalized = String(name).trim();
      db.prepare("DELETE FROM tag_pool WHERE name = ? OR id = ?").run(
        normalized,
        normalized,
      );
      return { ok: true, deleted: true };
    },
  };
}
