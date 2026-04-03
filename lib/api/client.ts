import { fallbackPhotoDetails, fallbackPhotos, fallbackSite } from "@/lib/api/fallback-data";
import { getClientApiBaseUrl, getServerApiBaseUrl } from "@/lib/api/config";
import type { PhotoDetail, PhotosResponse, SiteResponse } from "@/lib/api/types";

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
    return fallbackSite;
  }
}

export async function getPhotos() {
  try {
    const response = await fetchJson<PhotosResponse>("/api/photos?page=1&pageSize=30");
    return response.items;
  } catch {
    return fallbackPhotos;
  }
}

export async function getPhotoDetail(id: string) {
  try {
    return await fetchClientJson<PhotoDetail>(`/api/photos/${id}`);
  } catch {
    return fallbackPhotoDetails[id] ?? null;
  }
}
