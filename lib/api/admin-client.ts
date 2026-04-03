import type { ExtractedExif } from "@/lib/upload/exif";
import { getClientApiBaseUrl, getServerApiBaseUrl } from "@/lib/api/config";
import type { PhotoDetail, PhotosResponse, SiteConfigResponse, SiteResponse } from "@/lib/api/types";

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

export type UpdateSiteResponse = {
  ok: boolean;
  message?: string;
  error?: string;
  status?: number;
};

export type UpdateSitePayload = {
  siteTitle?: string;
  siteDescription?: string;
  watermarkEnabledByDefault?: boolean;
  watermarkText?: string;
  adminPassword?: string;
};

export type TagPool = {
  id: string;
  name: string;
  createdAt: string;
};

export type GetTagPoolResponse = {
  ok: boolean;
  tags: TagPool[];
  status?: number;
};

export type CreateTagPayload = {
  name: string;
};

export type CreateTagResponse = {
  ok: boolean;
  tag?: TagPool;
  error?: string;
  status?: number;
};

export type DeleteTagResponse = {
  ok: boolean;
  error?: string;
  status?: number;
};

export type UpdatePhotoPayload = {
  description?: string;
  tags?: string[];
};

export type UpdatePhotoResponse = {
  ok: boolean;
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
  tags: string[];
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
  formData.set("tags", JSON.stringify(payload.tags));
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

export async function getAdminTags() {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/tags`, {
    method: "GET",
    credentials: "include"
  });

  return {
    ...((await response.json()) as GetTagPoolResponse),
    status: response.status
  };
}

export async function createTag(name: string) {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/tags`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ name })
  });

  return {
    ...((await response.json()) as CreateTagResponse),
    status: response.status
  };
}

export async function deleteTag(id: string) {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/tags/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  return {
    ...((await response.json()) as DeleteTagResponse),
    status: response.status
  };
}

export async function updatePhoto(id: string, payload: UpdatePhotoPayload) {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/photos/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return {
    ...((await response.json()) as UpdatePhotoResponse),
    status: response.status
  };
}

export async function updateSiteConfig(payload: UpdateSitePayload) {
  const response = await fetch(`${getClientApiBaseUrl()}/api/admin/site`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return {
    ...((await response.json()) as UpdateSiteResponse),
    status: response.status
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchClientJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getClientApiBaseUrl()}${path}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getSite() {
  try {
    return await fetchJson<SiteResponse>("/api/site");
  } catch {
    return {
      siteTitle: "Luminote",
      siteDescription: "A lightweight home for photography that lets the work breathe.",
      watermarkEnabledByDefault: true,
      watermarkText: "© Luminote"
    };
  }
}

export async function getPhotos(tag?: string) {
  try {
    const url = tag ? `/api/photos?page=1&pageSize=30&tag=${encodeURIComponent(tag)}` : "/api/photos?page=1&pageSize=30";
    const response = await fetchClientJson<PhotosResponse>(url);
    return response.items;
  } catch {
    return [];
  }
}

export async function getPhotoDetail(id: string) {
  try {
    return await fetchClientJson<any>(`/api/photos/${id}`);
  } catch {
    return null;
  }
}
