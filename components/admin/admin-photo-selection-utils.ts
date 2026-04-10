import type { PhotoSummary } from "@/lib/api/types";

export function getSelectedPhotos(photos: PhotoSummary[], selectedPhotoIds: string[]) {
  return photos.filter((photo) => selectedPhotoIds.includes(photo.id));
}

export function getAllPhotosSelected(photos: PhotoSummary[], selectedPhotoIds: string[]) {
  return photos.length > 0 && photos.every((photo) => selectedPhotoIds.includes(photo.id));
}

export function getSelectedVisiblePhotoCount(selectedPhotos: PhotoSummary[]) {
  return selectedPhotos.filter((photo) => !photo.isHidden).length;
}

export function getSelectedHiddenPhotoCount(selectedPhotos: PhotoSummary[]) {
  return selectedPhotos.filter((photo) => photo.isHidden).length;
}

export function getHasSelectedBusyPhotos(
  selectedPhotos: PhotoSummary[],
  updatingPhotoIds: string[],
  deletingIds: string[],
) {
  return selectedPhotos.some((photo) => updatingPhotoIds.includes(photo.id) || deletingIds.includes(photo.id));
}

export function getIsBatchDeleting(selectedPhotoIds: string[], deletingIds: string[]) {
  return selectedPhotoIds.length > 0 && selectedPhotoIds.every((photoId) => deletingIds.includes(photoId));
}
