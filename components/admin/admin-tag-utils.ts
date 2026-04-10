import type { TagPool } from "@/lib/api/admin-client";
import type { UploadQueueItem } from "@/components/admin/admin-upload-utils";

export function buildPendingTag(name: string): TagPool {
  return {
    id: `pending_${crypto.randomUUID()}`,
    name,
    createdAt: new Date().toISOString(),
  };
}

export function removeTagName(values: string[], tagName: string) {
  return values.filter((value) => value !== tagName);
}

export function removeTagFromQueueItems(items: UploadQueueItem[], tagName: string) {
  return items.map((item) => ({
    ...item,
    tags: item.tags.filter((itemTag) => itemTag !== tagName),
  }));
}

export function getVisibleTags(predefinedTags: TagPool[], pendingTags: TagPool[]) {
  return [...predefinedTags, ...pendingTags];
}

export function validatePendingTagName(params: {
  normalizedName: string;
  predefinedTags: TagPool[];
  pendingTags: TagPool[];
  maxTagPoolSize: number;
  tagPoolLimitMessage: (limit: number) => string;
  duplicateTagMessage: string;
}) {
  const {
    normalizedName,
    predefinedTags,
    pendingTags,
    maxTagPoolSize,
    tagPoolLimitMessage,
    duplicateTagMessage,
  } = params;
  const allTags = [...predefinedTags, ...pendingTags];

  if (allTags.length >= maxTagPoolSize) {
    return tagPoolLimitMessage(maxTagPoolSize);
  }

  if (allTags.some((tag) => tag.name === normalizedName)) {
    return duplicateTagMessage;
  }

  return "";
}
