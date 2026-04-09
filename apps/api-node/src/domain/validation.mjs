import { TEXT_LIMITS, isWithinTextLimit } from "./text-limits.mjs";

const HOME_LAYOUTS = new Set(["masonry", "editorial", "spotlight"]);
const WATERMARK_POSITIONS = new Set([
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
]);

export function normalizeUniqueTags(tags, maxTagsPerPhoto = Infinity) {
  return Array.from(
    new Set(
      (Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag).trim())
        .filter(Boolean),
    ),
  ).slice(0, maxTagsPerPhoto);
}

export function validatePhotoDescription(description) {
  if (!isWithinTextLimit(description || "", TEXT_LIMITS.photoDescription)) {
    throw new Error(
      `Photo description cannot exceed ${TEXT_LIMITS.photoDescription} characters.`,
    );
  }
}

export function validateTagName(name) {
  const normalized = String(name || "").trim();

  if (!normalized) {
    throw new Error("Tag name is required.");
  }

  if (!isWithinTextLimit(normalized, TEXT_LIMITS.tagName)) {
    throw new Error(
      `Tag name cannot exceed ${TEXT_LIMITS.tagName} characters.`,
    );
  }

  return normalized;
}

export function validatePhotoTags(tags, maxTagsPerPhoto) {
  const normalized = normalizeUniqueTags(tags, maxTagsPerPhoto);

  if (normalized.some((tag) => !isWithinTextLimit(tag, TEXT_LIMITS.tagName))) {
    throw new Error(
      `Each tag cannot exceed ${TEXT_LIMITS.tagName} characters.`,
    );
  }

  if (normalized.length > maxTagsPerPhoto) {
    throw new Error(`Each photo can have at most ${maxTagsPerPhoto} tags.`);
  }

  return normalized;
}

export function validateUploadCount(count, maxUploadFiles) {
  if (count <= 0) {
    throw new Error("No files were provided.");
  }

  if (count > maxUploadFiles) {
    throw new Error(`You can upload at most ${maxUploadFiles} files at once.`);
  }
}

export function validateSitePatch(patch) {
  if (
    patch.siteTitle !== undefined &&
    (!String(patch.siteTitle).trim() ||
      !isWithinTextLimit(patch.siteTitle, TEXT_LIMITS.siteTitle))
  ) {
    throw new Error(`Site title must be 1-${TEXT_LIMITS.siteTitle} characters.`);
  }

  if (
    patch.siteDescription !== undefined &&
    !isWithinTextLimit(patch.siteDescription, TEXT_LIMITS.siteDescription)
  ) {
    throw new Error(
      `Site description cannot exceed ${TEXT_LIMITS.siteDescription} characters.`,
    );
  }

  if (
    patch.watermarkText !== undefined &&
    (!String(patch.watermarkText).trim() ||
      !isWithinTextLimit(patch.watermarkText, TEXT_LIMITS.watermarkText))
  ) {
    throw new Error(
      `Watermark text must be 1-${TEXT_LIMITS.watermarkText} characters.`,
    );
  }

  if (
    patch.homeLayout !== undefined &&
    !HOME_LAYOUTS.has(String(patch.homeLayout))
  ) {
    throw new Error("Invalid home layout.");
  }

  if (
    patch.watermarkPosition !== undefined &&
    !WATERMARK_POSITIONS.has(String(patch.watermarkPosition))
  ) {
    throw new Error("Invalid watermark position.");
  }

  for (const [key, limit] of [
    ["photographerName", TEXT_LIMITS.photographerName],
    ["photographerBio", TEXT_LIMITS.photographerBio],
    ["photographerEmail", TEXT_LIMITS.email],
    ["photographerXiaohongshu", TEXT_LIMITS.accountName],
    ["photographerXiaohongshuUrl", TEXT_LIMITS.url],
    ["photographerDouyin", TEXT_LIMITS.accountName],
    ["photographerDouyinUrl", TEXT_LIMITS.url],
    ["photographerInstagram", TEXT_LIMITS.accountName],
    ["photographerInstagramUrl", TEXT_LIMITS.url],
    ["photographerCustomAccount", TEXT_LIMITS.accountName],
    ["photographerCustomAccountUrl", TEXT_LIMITS.url],
    ["photographerAvatarUrl", TEXT_LIMITS.url],
  ]) {
    if (patch[key] !== undefined && !isWithinTextLimit(patch[key], limit)) {
      throw new Error(`${key} exceeds the allowed length.`);
    }
  }

  for (const numericKey of [
    "maxTagPoolSize",
    "maxUploadFiles",
    "maxTagsPerPhoto",
  ]) {
    if (
      patch[numericKey] !== undefined &&
      (!Number.isInteger(patch[numericKey]) || patch[numericKey] <= 0)
    ) {
      throw new Error(`${numericKey} must be a positive integer.`);
    }
  }
}
