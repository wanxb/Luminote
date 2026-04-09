import { photoDetails, photos, listTags, site } from "../data.mjs";

function resolveAssetUrl(baseUrl, pathname) {
  return new URL(pathname, baseUrl).toString();
}

function buildSite(baseUrl, currentSite) {
  return {
    ...currentSite,
    photographerAvatarUrl: currentSite.photographerAvatarUrl
      ? resolveAssetUrl(baseUrl, currentSite.photographerAvatarUrl)
      : "",
  };
}

function buildPhotoSummary(baseUrl, photo) {
  return {
    ...photo,
    thumbUrl: resolveAssetUrl(baseUrl, photo.thumbUrl),
    displayUrl: resolveAssetUrl(baseUrl, photo.displayUrl),
    watermarkedDisplayUrl: resolveAssetUrl(baseUrl, photo.watermarkedDisplayUrl),
  };
}

function buildPhotoDetail(baseUrl, detail) {
  return {
    ...detail,
    thumbUrl: resolveAssetUrl(baseUrl, detail.thumbUrl),
    displayUrl: resolveAssetUrl(baseUrl, detail.displayUrl),
    watermarkedDisplayUrl: resolveAssetUrl(baseUrl, detail.watermarkedDisplayUrl),
  };
}

export function createInMemoryPublicContentRepository(baseUrl) {
  return {
    async getSite() {
      return buildSite(baseUrl, site);
    },

    async getTagNames() {
      return listTags();
    },

    async listPhotos({ tag, page, pageSize }) {
      const filtered = tag
        ? photos.filter((photo) => photo.tags.includes(tag))
        : photos;
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
      const detail = photoDetails[id];
      return detail ? buildPhotoDetail(baseUrl, detail) : null;
    },
  };
}
