import type { ExtractedExif } from "@/lib/upload/exif";
import { getClientApiBaseUrl } from "@/lib/api/config";

export type AdminLoginResponse = {
  ok: boolean;
  token?: string;
  error?: string;
};

export type UploadResult = {
  id: string;
  fileName: string;
  watermarkEnabled: boolean;
  tags: string[];
  persisted: boolean;
};

export type UploadPhotosResponse = {
  ok: boolean;
  uploaded: UploadResult[];
  failed: Array<{ fileName: string; error: string }>;
  error?: string;
};

export type UploadPayload = {
  token: string;
  files: File[];
  thumbnails: File[];
  exifRecords: ExtractedExif[];
  description: string;
  tags: string;
  showDateInfo: boolean;
  showCameraInfo: boolean;
  showLocationInfo: boolean;
  watermarkEnabled: boolean;
};

export async function loginAdmin(password: string) {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  return (await response.json()) as AdminLoginResponse;
}

export async function uploadPhotos(payload: UploadPayload) {
  const formData = new FormData();
  formData.set("description", payload.description);
  formData.set("tags", payload.tags);
  formData.set("showDateInfo", String(payload.showDateInfo));
  formData.set("showCameraInfo", String(payload.showCameraInfo));
  formData.set("showLocationInfo", String(payload.showLocationInfo));
  formData.set("watermarkEnabled", String(payload.watermarkEnabled));

  for (const file of payload.files) {
    formData.append("files[]", file);
  }

  for (const thumbnail of payload.thumbnails) {
    formData.append("thumbnails[]", thumbnail);
  }

  for (const exifRecord of payload.exifRecords) {
    formData.append("exif[]", JSON.stringify(exifRecord));
  }

  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/photos`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${payload.token}`
    },
    body: formData
  });

  return (await response.json()) as UploadPhotosResponse;
}
