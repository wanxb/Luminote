import type { Env } from "../index";
import { storePhotoObjects } from "./storage-service";

type PersistedPhotoRow = {
  id: string;
  thumb_url: string;
  display_url: string;
  watermarked_display_url: string | null;
  taken_at: string | null;
  description: string | null;
};

type PhotoDetailRow = PersistedPhotoRow & {
  device: string | null;
  lens: string | null;
  location: string | null;
  exif_json: string | null;
  tags_json: string | null;
  show_camera_info: number;
  show_date_info: number;
  show_location_info: number;
};

type ExifPayload = {
  takenAt?: string;
  device?: string;
  lens?: string;
  location?: string;
  exif?: {
    aperture?: string;
    shutter?: string;
    iso?: number;
    focalLength?: string;
    latitude?: number;
    longitude?: number;
  };
};

type CreatePhotoInput = {
  fileName: string;
  file: File;
  thumbnail?: File;
  exif?: ExifPayload;
  description: string;
  tags: string[];
  showDateInfo: boolean;
  showCameraInfo: boolean;
  showLocationInfo: boolean;
  watermarkEnabled: boolean;
};

type CreatedPhoto = {
  id: string;
  fileName: string;
  watermarkEnabled: boolean;
  tags: string[];
  persisted: boolean;
};

const fallbackPhotos = [
  {
    id: "photo_001",
    thumbUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1800&q=80",
    takenAt: "2026-03-01T18:23:00Z",
    description: "黄昏街头的人群"
  },
  {
    id: "photo_002",
    thumbUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    takenAt: "2026-02-11T06:45:00Z",
    description: "海边的晨光"
  },
  {
    id: "photo_003",
    thumbUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    displayUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80",
    takenAt: "2026-01-15T09:10:00Z",
    description: "逆光中的肖像"
  }
];

function buildMockAssetUrl(origin: string, variant: "thumb" | "display" | "watermarked", id: string) {
  return `${origin}/mock-storage/${variant}/${id}`;
}

function createPhotoId(index: number) {
  return `photo_${Date.now()}_${index + 1}`;
}

export async function listPhotos(env: Env, origin: string) {
  if (!env.DB) {
    return fallbackPhotos;
  }

  const result = await env.DB.prepare(
    `SELECT id, thumb_url, display_url, watermarked_display_url, taken_at, description
     FROM photos
     ORDER BY created_at DESC
     LIMIT 30`
  ).all<PersistedPhotoRow>();

  const rows = result.results ?? [];

  if (rows.length === 0) {
    return fallbackPhotos;
  }

  return rows.map((row) => ({
    id: row.id,
    thumbUrl: row.thumb_url || buildMockAssetUrl(origin, "thumb", row.id),
    displayUrl:
      row.watermarked_display_url || row.display_url || buildMockAssetUrl(origin, "display", row.id),
    takenAt: row.taken_at ?? undefined,
    description: row.description ?? undefined
  }));
}

export async function getPhotoById(env: Env, origin: string, id: string) {
  if (!env.DB) {
    return fallbackPhotos.find((photo) => photo.id === id) ?? null;
  }

  const row = await env.DB.prepare(
    `SELECT
      id,
      thumb_url,
      display_url,
      watermarked_display_url,
      taken_at,
      description,
      device,
      lens,
      location,
      exif_json,
      tags_json,
      show_camera_info,
      show_date_info,
      show_location_info
     FROM photos
     WHERE id = ?
     LIMIT 1`
  )
    .bind(id)
    .first<PhotoDetailRow>();

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    thumbUrl: row.thumb_url || buildMockAssetUrl(origin, "thumb", row.id),
    displayUrl:
      row.watermarked_display_url || row.display_url || buildMockAssetUrl(origin, "display", row.id),
    takenAt: row.taken_at ?? undefined,
    description: row.description ?? undefined,
    device: row.show_camera_info ? row.device ?? undefined : undefined,
    lens: row.show_camera_info ? row.lens ?? undefined : undefined,
    location: row.show_location_info ? row.location ?? undefined : undefined,
    exif: row.exif_json ? JSON.parse(row.exif_json) : {},
    tags: row.tags_json ? JSON.parse(row.tags_json) : []
  };
}

export async function createPhotos(env: Env, origin: string, inputs: CreatePhotoInput[]) {
  const created: CreatedPhoto[] = inputs.map((input, index) => ({
    id: createPhotoId(index),
    fileName: input.fileName,
    watermarkEnabled: input.watermarkEnabled,
    tags: input.tags,
    persisted: Boolean(env.DB)
  }));

  if (!env.DB || created.length === 0) {
    return created;
  }

  const createdAt = new Date().toISOString();
  const storageResults = await Promise.all(
    created.map((photo, index) =>
      storePhotoObjects(env, {
        id: photo.id,
        original: inputs[index].file,
        thumbnail: inputs[index].thumbnail
      })
    )
  );
  const statements = created.map((photo, index) => {
    const input = inputs[index];
    const storage = storageResults[index];
    const thumbUrl = storage.persisted
      ? `${origin}/assets/thumb/${photo.id}`
      : buildMockAssetUrl(origin, "thumb", photo.id);
    const displayUrl = storage.persisted
      ? `${origin}/assets/display/${photo.id}`
      : buildMockAssetUrl(origin, "display", photo.id);
    const watermarkedDisplayUrl = input.watermarkEnabled
      ? storage.persisted
        ? `${origin}/assets/display/${photo.id}`
        : buildMockAssetUrl(origin, "watermarked", photo.id)
      : null;

    return env.DB!.prepare(
      `INSERT INTO photos (
        id,
        original_file_name,
        title,
        description,
        original_url,
        thumb_url,
        display_url,
        watermarked_display_url,
        taken_at,
        device,
        lens,
        location,
        exif_json,
        tags_json,
        show_camera_info,
        show_date_info,
        show_location_info,
        watermark_enabled,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      photo.id,
      input.fileName,
      "",
      input.description,
      storage.persisted ? `${origin}/assets/display/${photo.id}` : displayUrl,
      thumbUrl,
      displayUrl,
      watermarkedDisplayUrl,
      input.exif?.takenAt ?? null,
      input.exif?.device ?? null,
      input.exif?.lens ?? null,
      input.exif?.location ?? null,
      input.exif?.exif ? JSON.stringify(input.exif.exif) : null,
      JSON.stringify(input.tags),
      input.showCameraInfo ? 1 : 0,
      input.showDateInfo ? 1 : 0,
      input.showLocationInfo ? 1 : 0,
      input.watermarkEnabled ? 1 : 0,
      createdAt
    );
  });

  await env.DB.batch(statements);

  return created;
}
