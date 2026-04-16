import { readFile } from "node:fs/promises";

function resolveAssetUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl).toString();
}

function resolveOriginalUrl(baseUrl, pathname) {
  return pathname && pathname.includes("/assets/original/")
    ? resolveAssetUrl(baseUrl, pathname)
    : undefined;
}

function buildSite(baseUrl, site) {
  return {
    ...site,
    photographerAvatarUrl: site.photographerAvatarUrl
      ? resolveAssetUrl(baseUrl, site.photographerAvatarUrl)
      : "",
  };
}

function buildPhotoSummary(baseUrl, photo) {
  return {
    ...photo,
    thumbUrl: resolveAssetUrl(baseUrl, photo.thumbUrl),
    displayUrl: resolveAssetUrl(baseUrl, photo.displayUrl),
    originalUrl: resolveOriginalUrl(baseUrl, photo.originalUrl),
    watermarkedDisplayUrl: photo.watermarkedDisplayUrl
      ? resolveAssetUrl(baseUrl, photo.watermarkedDisplayUrl)
      : undefined,
  };
}

function buildPhotoDetail(baseUrl, detail) {
  return {
    ...detail,
    thumbUrl: resolveAssetUrl(baseUrl, detail.thumbUrl),
    displayUrl: resolveAssetUrl(baseUrl, detail.displayUrl),
    originalUrl: resolveOriginalUrl(baseUrl, detail.originalUrl),
    watermarkedDisplayUrl: detail.watermarkedDisplayUrl
      ? resolveAssetUrl(baseUrl, detail.watermarkedDisplayUrl)
      : undefined,
  };
}

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

export function createFilePublicContentRepository({ baseUrl, filePath }) {
  return {
    async getSite() {
      const content = await loadContentFile(filePath);
      return buildSite(baseUrl, content.site);
    },

    async getTagNames() {
      const content = await loadContentFile(filePath);
      if (content.tagPool.length > 0) {
        return content.tagPool.map((tag) => tag.name);
      }
      return Array.from(
        new Set(
          content.photos.flatMap((photo) =>
            Array.isArray(photo.tags) ? photo.tags : [],
          ),
        ),
      ).sort();
    },

    async listPhotos({ tag, page, pageSize }) {
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
          .map((photo) => buildPhotoSummary(baseUrl, photo)),
        hasMore: start + pageSize < filtered.length,
        total: filtered.length,
      };
    },

    async getPhotoDetail(id) {
      const content = await loadContentFile(filePath);
      const detail = content.photoDetails[id];
      return detail ? buildPhotoDetail(baseUrl, detail) : null;
    },
  };
}
