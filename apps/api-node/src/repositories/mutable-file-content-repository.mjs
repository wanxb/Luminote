import { readFile, writeFile } from "node:fs/promises";
import {
  validatePhotoDescription,
  validatePhotoTags,
  validateSitePatch,
  validateTagName,
} from "../domain/validation.mjs";

async function loadContentFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  return {
    site: parsed.site || {},
    tagPool: Array.isArray(parsed.tagPool) ? parsed.tagPool : [],
    photos: Array.isArray(parsed.photos) ? parsed.photos : [],
    photoDetails: parsed.photoDetails || {},
  };
}

async function saveContentFile(filePath, content) {
  await writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

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

function buildAdminPhoto(baseUrl, photo) {
  return {
    ...photo,
    thumbUrl: resolveAssetUrl(baseUrl, photo.thumbUrl),
    displayUrl: resolveAssetUrl(baseUrl, photo.displayUrl),
    watermarkedDisplayUrl: photo.watermarkedDisplayUrl
      ? resolveAssetUrl(baseUrl, photo.watermarkedDisplayUrl)
      : undefined,
  };
}

export function createMutableFileContentRepository({ filePath, baseUrl }) {
  return {
    async listTags() {
      const content = await loadContentFile(filePath);
      return content.tagPool;
    },

    async getSiteSettings() {
      const content = await loadContentFile(filePath);
      return content.site;
    },

    async createPhoto(input) {
      const content = await loadContentFile(filePath);
      const normalizedSourceHash = input.sourceHash?.trim();

      if (
        normalizedSourceHash &&
        content.photos.some((photo) => photo.sourceHash === normalizedSourceHash)
      ) {
        throw new Error("Duplicate photo content detected.");
      }

      const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      validatePhotoDescription(input.description || "");
      const tags = validatePhotoTags(
        input.tags || [],
        content.site.maxTagsPerPhoto || 5,
      );
      const photo = {
        id,
        thumbUrl: `/assets/thumb/${id}`,
        displayUrl: `/assets/display/${id}`,
        watermarkedDisplayUrl: input.watermarkEnabled
          ? `/assets/display-watermarked/${id}`
          : undefined,
        watermarkEnabled: Boolean(input.watermarkEnabled),
        isHidden: false,
        takenAt: input.takenAt,
        description: input.description || "",
        tags,
        sourceHash: normalizedSourceHash || undefined,
      };

      content.photos.unshift(photo);
      content.photoDetails[id] = {
        ...photo,
        device: input.device,
        lens: input.lens,
        location: input.location,
        exif: input.exif,
        tags,
      };

      await saveContentFile(filePath, content);

      return {
        id,
        fileName: input.fileName,
        watermarkEnabled: Boolean(input.watermarkEnabled),
        tags,
        persisted: true,
      };
    },

    async listAdminPhotos({ tag, page, pageSize }) {
      const content = await loadContentFile(filePath);
      const filtered = tag
        ? content.photos.filter(
            (photo) => Array.isArray(photo.tags) && photo.tags.includes(tag),
          )
        : content.photos;
      const start = (page - 1) * pageSize;

      return {
        items: filtered
          .slice(start, start + pageSize)
          .map((photo) => buildAdminPhoto(baseUrl, photo)),
        hasMore: start + pageSize < filtered.length,
        total: filtered.length,
        unfilteredTotal: content.photos.length,
      };
    },

    async updatePhoto(id, updates) {
      const content = await loadContentFile(filePath);
      const index = content.photos.findIndex((photo) => photo.id === id);

      if (index < 0) {
        return {
          ok: false,
          persisted: true,
          error: "Photo not found.",
        };
      }

      const current = content.photos[index];

      if (updates.description !== undefined) {
        validatePhotoDescription(updates.description);
      }

      const nextTags =
        updates.tags !== undefined
          ? validatePhotoTags(
              updates.tags,
              content.site.maxTagsPerPhoto || 5,
            )
          : current.tags || [];

      content.photos[index] = {
        ...current,
        ...(updates.description !== undefined
          ? { description: updates.description }
          : {}),
        ...(updates.isHidden !== undefined
          ? { isHidden: Boolean(updates.isHidden) }
          : {}),
        ...(updates.tags !== undefined ? { tags: nextTags } : {}),
      };

      if (content.photoDetails?.[id]) {
        content.photoDetails[id] = {
          ...content.photoDetails[id],
          ...(updates.description !== undefined
            ? { description: updates.description }
            : {}),
          ...(updates.isHidden !== undefined
            ? { isHidden: Boolean(updates.isHidden) }
            : {}),
          ...(updates.tags !== undefined ? { tags: nextTags } : {}),
        };
      }

      await saveContentFile(filePath, content);

      return {
        ok: true,
        persisted: true,
      };
    },

    async deletePhoto(id) {
      const content = await loadContentFile(filePath);
      const existing = content.photos.some((photo) => photo.id === id);

      if (!existing) {
        return {
          ok: false,
          deleted: false,
          persisted: true,
          error: "Photo not found or already deleted.",
        };
      }

      content.photos = content.photos.filter((photo) => photo.id !== id);

      if (content.photoDetails?.[id]) {
        delete content.photoDetails[id];
      }

      await saveContentFile(filePath, content);

      return {
        ok: true,
        deleted: true,
        persisted: true,
      };
    },

    async updateSite(updates) {
      const content = await loadContentFile(filePath);
      validateSitePatch(updates);
      content.site = {
        ...content.site,
        ...updates,
      };
      await saveContentFile(filePath, content);
      return content.site;
    },

    async createTag(name) {
      const content = await loadContentFile(filePath);
      const normalized = validateTagName(name);

      const existing = content.tagPool.map((tag) => tag.name);

      if (existing.includes(normalized)) {
        return {
          id: `tag_${normalized.toLowerCase().replace(/\s+/g, "_")}`,
          name: normalized,
          createdAt: new Date().toISOString(),
        };
      }

      if (content.tagPool.length >= (content.site.maxTagPoolSize || 20)) {
        throw new Error(
          `Tag pool limit reached: ${content.site.maxTagPoolSize || 20}.`,
        );
      }

      content.tagPool.push({
        id: `tag_${normalized.toLowerCase().replace(/\s+/g, "_")}`,
        name: normalized,
        createdAt: new Date().toISOString(),
      });

      await saveContentFile(filePath, content);

      return {
        id: `tag_${normalized.toLowerCase().replace(/\s+/g, "_")}`,
        name: normalized,
        createdAt: new Date().toISOString(),
      };
    },

    async deleteTag(name) {
      const content = await loadContentFile(filePath);
      const normalized = String(name).trim();

      content.tagPool = content.tagPool.filter(
        (tag) => tag.name !== normalized && tag.id !== normalized,
      );

      await saveContentFile(filePath, content);

      return {
        ok: true,
        deleted: true,
      };
    },
  };
}
