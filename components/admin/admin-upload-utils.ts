import type { TagPool } from "@/lib/api/admin-client";

export type UploadQueueItem = {
  id: string;
  key: string;
  file: File;
  previewUrl: string;
  tags: string[];
};

export function uniqueTags(tags: string[], maxTagsPerPhoto: number) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).slice(0, maxTagsPerPhoto);
}

export function haveSameTags(left: string[], right: string[], maxTagsPerPhoto: number) {
  const normalizedLeft = uniqueTags(left, maxTagsPerPhoto);
  const normalizedRight = uniqueTags(right, maxTagsPerPhoto);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((tag, index) => tag === normalizedRight[index])
  );
}

export function buildFileKey(file: File) {
  return [file.name, file.size, file.lastModified].join(":");
}

export function createUploadQueueItem(file: File): UploadQueueItem {
  return {
    id: `upload_${crypto.randomUUID()}`,
    key: buildFileKey(file),
    file,
    previewUrl: URL.createObjectURL(file),
    tags: []
  };
}

export function revokeUploadQueueItems(items: UploadQueueItem[]) {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

export function normalizeTag(tag: TagPool | ({ created_at?: string } & Partial<TagPool>)) {
  const legacyCreatedAt = "created_at" in tag ? tag.created_at : undefined;

  return {
    id: tag.id,
    name: tag.name,
    createdAt: tag.createdAt ?? legacyCreatedAt ?? new Date().toISOString()
  } as TagPool;
}
