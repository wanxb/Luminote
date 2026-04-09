import { fallbackSite } from "@/lib/api/fallback-data";
import { getClientApiBaseUrl, getServerApiBaseUrl } from "@/lib/api/config";
import type {
  PhotoDetail,
  PhotosResponse,
  SiteResponse,
  SiteTagsResponse,
} from "@/lib/api/types";

type GetPhotosOptions = {
  tag?: string;
  page?: number;
  pageSize?: number;
};

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

export async function getSite() {
  try {
    return await fetchJson<SiteResponse>("/api/site");
  } catch {
    return fallbackSite;
  }
}

export async function getSiteTags() {
  try {
    const response = await fetchJson<SiteTagsResponse>("/api/site/tags");
    return Array.from(
      new Set(response.tags.map((tag) => tag.trim()).filter(Boolean)),
    );
  } catch {
    return [];
  }
}

export async function getPhotos(
  options: GetPhotosOptions = {},
): Promise<PhotosResponse> {
  const { tag, page = 1, pageSize = 30 } = options;

  try {
    const url = tag
      ? `/api/photos?page=${page}&pageSize=${pageSize}&tag=${encodeURIComponent(tag)}`
      : `/api/photos?page=${page}&pageSize=${pageSize}`;

    return await fetchJson<PhotosResponse>(url);
  } catch {
    return {
      items: [],
      page,
      pageSize,
      hasMore: false,
      total: 0,
      unfilteredTotal: 0,
    };
  }
}

export async function getPhotoDetail(id: string) {
  try {
    return await fetchClientJson<PhotoDetail>(`/api/photos/${id}`);
  } catch {
    return null;
  }
}
