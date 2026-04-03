import type { ExtractedExif } from "@/lib/upload/exif";
import { getClientApiBaseUrl } from "@/lib/api/config";

export type AdminLoginResponse = {
  ok: boolean;
  authenticated?: boolean;
  error?: string;
  status?: number;
};

export type AdminSessionResponse = {
  ok: boolean;
  authenticated: boolean;
  status?: number;
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
  status?: number;
};

export type DeletePhotoResponse = {
  ok: boolean;
  deleted: boolean;
  persisted: boolean;
  error?: string;
  status?: number;
};

export type UploadPayload = {
  files: File[];
  thumbnails: File[];
  displayFiles: File[];
  watermarkedDisplayFiles: Array<File | null>;
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
    credentials: "include",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  return {
    ...((await response.json()) as AdminLoginResponse),
    status: response.status
  };
}

export async function getAdminSession() {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/session`, {
    method: "GET",
    credentials: "include"
  });

  return {
    ...((await response.json()) as AdminSessionResponse),
    status: response.status
  };
}

export async function logoutAdmin() {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/logout`, {
    method: "POST",
    credentials: "include"
  });

  return (await response.json()) as { ok: boolean };
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

  for (const displayFile of payload.displayFiles) {
    formData.append("displayFiles[]", displayFile);
  }

  for (const watermarkedDisplayFile of payload.watermarkedDisplayFiles) {
    if (watermarkedDisplayFile) {
      formData.append("watermarkedDisplayFiles[]", watermarkedDisplayFile);
      continue;
    }

    formData.append("watermarkedDisplayFiles[]", new Blob([]), "");
  }

  for (const exifRecord of payload.exifRecords) {
    formData.append("exif[]", JSON.stringify(exifRecord));
  }

  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/photos`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  return {
    ...((await response.json()) as UploadPhotosResponse),
    status: response.status
  };
}

export async function deletePhoto(id: string) {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/photos/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  return {
    ...((await response.json()) as DeletePhotoResponse),
    status: response.status
  };
}
