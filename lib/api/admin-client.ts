import type { ExtractedExif } from "@/lib/upload/exif";
import { getClientApiBaseUrl, getServerApiBaseUrl } from "@/lib/api/config";
import type {
  HomeLayout,
  PhotoDetail,
  PhotosResponse,
  SiteConfigResponse,
  SiteResponse,
  WatermarkPosition,
} from "@/lib/api/types";

const API_TIMEOUT_MS = 8000;

function createAbortSignal(timeoutMs: number) {
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return AbortSignal.timeout(timeoutMs);
  }

  return undefined;
}

async function requestClientJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${getClientApiBaseUrl()}${path}`, {
    ...init,
    signal: createAbortSignal(API_TIMEOUT_MS),
  });

  return {
    response,
    data: (await response.json()) as T,
  };
}

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

export type UploadPhotographerAvatarResponse = {
  ok: boolean;
  url?: string;
  error?: string;
  status?: number;
};

export type UpdateSitePayload = {
  siteTitle?: string;
  siteDescription?: string;
  homeLayout?: HomeLayout;
  watermarkEnabledByDefault?: boolean;
  watermarkText?: string;
  watermarkPosition?: WatermarkPosition;
  adminPassword?: string;
  uploadOriginalEnabled?: boolean;
  maxTagPoolSize?: number;
  maxUploadFiles?: number;
  maxTagsPerPhoto?: number;
  photographerAvatarUrl?: string;
  photographerName?: string;
  photographerBio?: string;
  photographerEmail?: string;
  photographerXiaohongshu?: string;
  photographerXiaohongshuUrl?: string;
  photographerDouyin?: string;
  photographerDouyinUrl?: string;
  photographerInstagram?: string;
  photographerInstagramUrl?: string;
  photographerCustomAccount?: string;
  photographerCustomAccountUrl?: string;
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

type GetPhotosOptions = {
  tag?: string;
  page?: number;
  pageSize?: number;
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
  isHidden?: boolean;
};

export type UpdatePhotoResponse = {
  ok: boolean;
  error?: string;
  status?: number;
};

export type UploadPayload = {
  files: File[];
  sourceHashes: string[];
  thumbnails: File[];
  displayFiles: File[];
  watermarkedDisplayFiles: Array<File | null>;
  exifRecords: ExtractedExif[];
  description: string;
  tags: string[];
  photoDrafts?: Array<{
    description?: string;
    tags: string[];
  }>;
  showDateInfo: boolean;
  showCameraInfo: boolean;
  showLocationInfo: boolean;
  watermarkEnabled: boolean;
  storeOriginalFiles?: boolean;
};

type UploadPhotosOptions = {
  onProgress?: (progress: number) => void;
};

function uploadFormDataWithProgress<T>(
  path: string,
  formData: FormData,
  options?: UploadPhotosOptions,
) {
  return new Promise<{ response: { status: number }; data: T }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${getClientApiBaseUrl()}${path}`);
      xhr.withCredentials = true;
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        options?.onProgress?.(
          Math.min(100, Math.round((event.loaded / event.total) * 100)),
        );
      };

      xhr.onerror = () => {
        reject(new Error(`Request failed for ${path}`));
      };

      xhr.onload = () => {
        const data = (xhr.response ??
          JSON.parse(xhr.responseText || "{}")) as T;
        options?.onProgress?.(100);
        resolve({
          response: { status: xhr.status },
          data,
        });
      };

      xhr.send(formData);
    },
  );
}

export async function loginAdmin(password: string) {
  const { response, data } = await requestClientJson<AdminLoginResponse>(
    "/api/admin/login",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ password }),
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function getAdminSession() {
  const { response, data } = await requestClientJson<AdminSessionResponse>(
    "/api/admin/session",
    {
      method: "GET",
      credentials: "include",
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function logoutAdmin() {
  const { data } = await requestClientJson<{ ok: boolean }>(
    "/api/admin/logout",
    {
      method: "POST",
      credentials: "include",
    },
  );

  return data;
}

export async function uploadPhotos(
  payload: UploadPayload,
  options?: UploadPhotosOptions,
) {
  const formData = new FormData();
  formData.set("description", payload.description);
  formData.set(
    "fileNames",
    JSON.stringify(payload.files.map((file) => file.name)),
  );
  formData.set("sourceHashes", JSON.stringify(payload.sourceHashes));
  formData.set("tags", JSON.stringify(payload.tags));
  if (payload.photoDrafts) {
    formData.set("photoDrafts", JSON.stringify(payload.photoDrafts));
  }
  formData.set("showDateInfo", String(payload.showDateInfo));
  formData.set("showCameraInfo", String(payload.showCameraInfo));
  formData.set("showLocationInfo", String(payload.showLocationInfo));
  formData.set("watermarkEnabled", String(payload.watermarkEnabled));
  formData.set(
    "storeOriginalFiles",
    String(payload.storeOriginalFiles ?? false),
  );

  if (payload.storeOriginalFiles) {
    for (const file of payload.files) {
      formData.append("files[]", file);
    }
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

  const { response, data } =
    await uploadFormDataWithProgress<UploadPhotosResponse>(
      "/api/admin/photos",
      formData,
      options,
    );

  return {
    ...data,
    status: response.status,
  };
}

export async function deletePhoto(id: string) {
  const { response, data } = await requestClientJson<DeletePhotoResponse>(
    `/api/admin/photos/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function getAdminTags() {
  const { response, data } = await requestClientJson<GetTagPoolResponse>(
    "/api/admin/tags",
    {
      method: "GET",
      credentials: "include",
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function createTag(name: string) {
  const { response, data } = await requestClientJson<CreateTagResponse>(
    "/api/admin/tags",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name }),
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function deleteTag(id: string) {
  const { response, data } = await requestClientJson<DeleteTagResponse>(
    `/api/admin/tags/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function updatePhoto(id: string, payload: UpdatePhotoPayload) {
  const { response, data } = await requestClientJson<UpdatePhotoResponse>(
    `/api/admin/photos/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function updateSiteConfig(payload: UpdateSitePayload) {
  const { response, data } = await requestClientJson<UpdateSiteResponse>(
    "/api/admin/site",
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return {
    ...data,
    status: response.status,
  };
}

export async function uploadPhotographerAvatar(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const { response, data } =
    await requestClientJson<UploadPhotographerAvatarResponse>(
      "/api/admin/site/avatar",
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
    );

  return {
    ...data,
    status: response.status,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    method: "GET",
    cache: "no-store",
    signal: createAbortSignal(API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchClientJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getClientApiBaseUrl()}${path}`, {
    method: "GET",
    cache: "no-store",
    signal: createAbortSignal(API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getSite(): Promise<SiteResponse> {
  try {
    return await fetchJson<SiteResponse>("/api/site");
  } catch {
    return {
      siteTitle: "Luminote",
      siteDescription:
        "A lightweight home for photography that lets the work breathe.",
      homeLayout: "editorial" as HomeLayout,
      watermarkEnabledByDefault: true,
      watermarkText: "© Luminote",
      watermarkPosition: "bottom-right" as WatermarkPosition,
      uploadOriginalEnabled: false,
      maxTagPoolSize: 20,
      maxUploadFiles: 20,
      maxTagsPerPhoto: 5,
      photographerAvatarUrl: "",
      photographerName: "",
      photographerBio: "",
      photographerEmail: "",
      photographerXiaohongshu: "",
      photographerXiaohongshuUrl: "",
      photographerDouyin: "",
      photographerDouyinUrl: "",
      photographerInstagram: "",
      photographerInstagramUrl: "",
      photographerCustomAccount: "",
      photographerCustomAccountUrl: "",
    };
  }
}

export async function getPhotos(
  options: GetPhotosOptions = {},
): Promise<PhotosResponse> {
  const { tag, page = 1, pageSize = 30 } = options;
  const url = tag
    ? `${getClientApiBaseUrl()}/api/admin/photos?page=${page}&pageSize=${pageSize}&tag=${encodeURIComponent(tag)}`
    : `${getClientApiBaseUrl()}/api/admin/photos?page=${page}&pageSize=${pageSize}`;
  const rawResponse = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal: createAbortSignal(API_TIMEOUT_MS),
  });

  if (!rawResponse.ok) {
    throw new Error(`Request failed for ${url}: ${rawResponse.status}`);
  }

  return (await rawResponse.json()) as PhotosResponse;
}

export async function getPhotoDetail(id: string) {
  try {
    return await fetchClientJson<any>(`/api/photos/${id}`);
  } catch {
    return null;
  }
}
