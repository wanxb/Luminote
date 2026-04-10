import type { PhotoSummary } from "@/lib/api/types";

export function getBatchHiddenTargetIds(photos: PhotoSummary[], selectedPhotoIds: string[], nextHidden: boolean) {
  return photos
    .filter((photo) => selectedPhotoIds.includes(photo.id) && Boolean(photo.isHidden) !== nextHidden)
    .map((photo) => photo.id);
}

export function getBatchDeleteTargetIds(photos: PhotoSummary[], selectedPhotoIds: string[]) {
  return photos.filter((photo) => selectedPhotoIds.includes(photo.id)).map((photo) => photo.id);
}

export function updatePhotosByIds(
  photos: PhotoSummary[],
  targetIds: string[],
  applyChanges: (photo: PhotoSummary) => PhotoSummary,
) {
  return photos.map((photo) => (targetIds.includes(photo.id) ? applyChanges(photo) : photo));
}

export function clearPhotoTagDraft(
  drafts: Record<string, string[]>,
  photoId: string,
) {
  const nextDrafts = { ...drafts };
  delete nextDrafts[photoId];
  return nextDrafts;
}
