import type { Env } from "../index";
import { deletePhotoObjects, storePhotoObjects } from "./storage-service";

type PersistedPhotoRow = {
  id: string;
  thumb_url: string;
  display_url: string;
  watermarked_display_url: string | null;
  watermark_enabled: number;
  is_hidden: number;
  taken_at: string | null;
  description: string | null;
  tags_json: string | null;
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

let ensurePhotoVisibilityColumnPromise: Promise<void> | null = null;

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
  originalFile?: File;
  thumbnail?: File;
  displayFile?: File;
  watermarkedDisplayFile?: File;
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

function buildMockAssetUrl(
  origin: string,
  variant: "thumb" | "display" | "watermarked",
  id: string,
) {
  return `${origin}/mock-storage/${variant}/${id}`;
}

function buildAssetUrl(
  origin: string,
  variant: "thumb" | "display" | "display-watermarked",
  id: string,
) {
  return `${origin}/assets/${variant}/${id}`;
}

function createPhotoId(index: number) {
  return `photo_${Date.now()}_${index + 1}`;
}

function parseTagsJson(tagsJson: string | null) {
  if (!tagsJson) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(tagsJson) as unknown;
    return Array.isArray(parsed) ? parsed.map((tag) => String(tag)) : [];
  } catch {
    return [];
  }
}

function extractPhotoIdFromObjectKey(key: string) {
  const match = key.match(
    /^(?:thumbs|display|display-watermarked)\/(photo_[^./]+(?:_[^./]+)?)\.(?:webp|jpg)$/,
  );
  return match?.[1] ?? null;
}

async function listPhotosFromBucket(env: Env, origin: string) {
  if (!env.PHOTOS_BUCKET) {
    return [] as Array<{
      id: string;
      thumbUrl: string;
      displayUrl: string;
      watermarkedDisplayUrl?: string;
      watermarkEnabled: boolean;
      isHidden: boolean;
      description?: string;
      tags: string[];
    }>;
  }

  const [watermarkedObjects, displayObjects, thumbObjects] = await Promise.all([
    env.PHOTOS_BUCKET.list({ prefix: "display-watermarked/", limit: 1000 }),
    env.PHOTOS_BUCKET.list({ prefix: "display/", limit: 1000 }),
    env.PHOTOS_BUCKET.list({ prefix: "thumbs/", limit: 1000 }),
  ]);

  const photoMap = new Map<
    string,
    {
      id: string;
      uploadedAt: number;
      hasThumb: boolean;
      hasDisplay: boolean;
      hasWatermarked: boolean;
    }
  >();

  for (const object of watermarkedObjects.objects) {
    const id = extractPhotoIdFromObjectKey(object.key);

    if (!id) {
      continue;
    }

    photoMap.set(id, {
      id,
      uploadedAt: new Date(object.uploaded).getTime(),
      hasThumb: photoMap.get(id)?.hasThumb ?? false,
      hasDisplay: photoMap.get(id)?.hasDisplay ?? false,
      hasWatermarked: true,
    });
  }

  for (const object of displayObjects.objects) {
    const id = extractPhotoIdFromObjectKey(object.key);

    if (!id) {
      continue;
    }

    const current = photoMap.get(id);
    photoMap.set(id, {
      id,
      uploadedAt: current?.uploadedAt ?? new Date(object.uploaded).getTime(),
      hasThumb: current?.hasThumb ?? false,
      hasDisplay: true,
      hasWatermarked: current?.hasWatermarked ?? false,
    });
  }

  for (const object of thumbObjects.objects) {
    const id = extractPhotoIdFromObjectKey(object.key);

    if (!id) {
      continue;
    }

    const current = photoMap.get(id);
    photoMap.set(id, {
      id,
      uploadedAt: current?.uploadedAt ?? new Date(object.uploaded).getTime(),
      hasThumb: true,
      hasDisplay: current?.hasDisplay ?? false,
      hasWatermarked: current?.hasWatermarked ?? false,
    });
  }

  return Array.from(photoMap.values())
    .sort((left, right) => right.uploadedAt - left.uploadedAt)
    .slice(0, 30)
    .map((item) => ({
      id: item.id,
      thumbUrl: item.hasThumb
        ? buildAssetUrl(origin, "thumb", item.id)
        : buildAssetUrl(origin, "display", item.id),
      displayUrl: buildAssetUrl(origin, "display", item.id),
      watermarkedDisplayUrl: item.hasWatermarked
        ? buildAssetUrl(origin, "display-watermarked", item.id)
        : undefined,
      watermarkEnabled: item.hasWatermarked,
      isHidden: false,
      description: undefined,
      tags: [],
    }));
}

async function ensurePhotoVisibilityColumn(env: Env) {
  if (!env.DB) {
    return;
  }

  if (!ensurePhotoVisibilityColumnPromise) {
    ensurePhotoVisibilityColumnPromise = (async () => {
      try {
        await env
          .DB!.prepare(
            "ALTER TABLE photos ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0",
          )
          .run();
      } catch {
        // Ignore if the column already exists or the database is managed elsewhere.
      }
    })();
  }

  await ensurePhotoVisibilityColumnPromise;
}

export async function listPhotos(
  env: Env,
  origin: string,
  tag: string | null = null,
  options?: { includeHidden?: boolean },
) {
  if (!env.DB) {
    return tag ? [] : listPhotosFromBucket(env, origin);
  }

  await ensurePhotoVisibilityColumn(env);

  const conditions: string[] = [];
  const values: unknown[] = [];

  let query = `SELECT id, thumb_url, display_url, watermarked_display_url, watermark_enabled, is_hidden, taken_at, description, tags_json
     FROM photos`;

  if (!options?.includeHidden) {
    conditions.push("is_hidden = 0");
  }

  if (tag) {
    conditions.push("tags_json LIKE ?");
    values.push(`%${tag}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY created_at DESC LIMIT 30`;

  try {
    const result = await env.DB.prepare(query)
      .bind(...values)
      .all<PersistedPhotoRow>();
    const rows = result.results ?? [];

    if (rows.length === 0 && !tag) {
      return listPhotosFromBucket(env, origin);
    }

    return rows.map((row) => ({
      id: row.id,
      thumbUrl: row.thumb_url || buildMockAssetUrl(origin, "thumb", row.id),
      displayUrl:
        row.display_url || buildMockAssetUrl(origin, "display", row.id),
      watermarkedDisplayUrl: row.watermarked_display_url || undefined,
      watermarkEnabled: Boolean(row.watermark_enabled),
      isHidden: Boolean(row.is_hidden),
      takenAt: row.taken_at ?? undefined,
      description: row.description ?? undefined,
      tags: parseTagsJson(row.tags_json),
    }));
  } catch {
    return tag ? [] : listPhotosFromBucket(env, origin);
  }
}

export async function getPhotoById(
  env: Env,
  origin: string,
  id: string,
  options?: { includeHidden?: boolean },
) {
  if (!env.DB) {
    const bucketPhotos = await listPhotosFromBucket(env, origin);
    const bucketPhoto = bucketPhotos.find((photo) => photo.id === id);
    return bucketPhoto ? { ...bucketPhoto, tags: [] } : null;
  }

  await ensurePhotoVisibilityColumn(env);

  let row: PhotoDetailRow | null = null;

  try {
    row = await env.DB.prepare(
      `SELECT
        id,
        thumb_url,
        display_url,
        watermarked_display_url,
        watermark_enabled,
        is_hidden,
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
       LIMIT 1`,
    )
      .bind(id)
      .first<PhotoDetailRow>();
  } catch {
    const bucketPhotos = await listPhotosFromBucket(env, origin);
    const bucketPhoto = bucketPhotos.find((photo) => photo.id === id);
    return bucketPhoto ? { ...bucketPhoto, tags: [] } : null;
  }

  if (!row) {
    const bucketPhotos = await listPhotosFromBucket(env, origin);
    const bucketPhoto = bucketPhotos.find((photo) => photo.id === id);
    return bucketPhoto ? { ...bucketPhoto, tags: [] } : null;
  }

  if (row.is_hidden && !options?.includeHidden) {
    return null;
  }

  return {
    id: row.id,
    thumbUrl: row.thumb_url || buildMockAssetUrl(origin, "thumb", row.id),
    displayUrl: row.display_url || buildMockAssetUrl(origin, "display", row.id),
    watermarkedDisplayUrl: row.watermarked_display_url || undefined,
    watermarkEnabled: Boolean(row.watermark_enabled),
    isHidden: Boolean(row.is_hidden),
    takenAt: row.taken_at ?? undefined,
    description: row.description ?? undefined,
    device: row.show_camera_info ? (row.device ?? undefined) : undefined,
    lens: row.show_camera_info ? (row.lens ?? undefined) : undefined,
    location: row.show_location_info ? (row.location ?? undefined) : undefined,
    exif: row.exif_json ? JSON.parse(row.exif_json) : {},
    tags: parseTagsJson(row.tags_json),
  };
}

export async function createPhotos(
  env: Env,
  origin: string,
  inputs: CreatePhotoInput[],
) {
  const created: CreatedPhoto[] = inputs.map((input, index) => ({
    id: createPhotoId(index),
    fileName: input.fileName,
    watermarkEnabled: input.watermarkEnabled,
    tags: input.tags,
    persisted: Boolean(env.DB),
  }));

  if (!env.DB || created.length === 0) {
    return created;
  }

  await ensurePhotoVisibilityColumn(env);

  const createdAt = new Date().toISOString();
  const storageResults = await Promise.all(
    created.map((photo, index) =>
      storePhotoObjects(env, {
        id: photo.id,
        original: inputs[index].originalFile,
        thumbnail: inputs[index].thumbnail,
        display: inputs[index].displayFile,
        watermarkedDisplay: inputs[index].watermarkedDisplayFile,
      }),
    ),
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
        ? `${origin}/assets/display-watermarked/${photo.id}`
        : buildMockAssetUrl(origin, "watermarked", photo.id)
      : null;

    return env
      .DB!.prepare(
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
        is_hidden,
        show_camera_info,
        show_date_info,
        show_location_info,
        watermark_enabled,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        photo.id,
        input.fileName,
        "",
        input.description,
        storage.originalKey ? storage.originalKey : displayUrl,
        thumbUrl,
        displayUrl,
        watermarkedDisplayUrl,
        input.exif?.takenAt ?? null,
        input.exif?.device ?? null,
        input.exif?.lens ?? null,
        input.exif?.location ?? null,
        input.exif?.exif ? JSON.stringify(input.exif.exif) : null,
        JSON.stringify(input.tags),
        0,
        input.showCameraInfo ? 1 : 0,
        input.showDateInfo ? 1 : 0,
        input.showLocationInfo ? 1 : 0,
        input.watermarkEnabled ? 1 : 0,
        createdAt,
      );
  });

  await env.DB.batch(statements);

  return created;
}

export async function deletePhotoById(env: Env, id: string) {
  if (!env.DB) {
    return {
      ok: false,
      deleted: false,
      persisted: false,
      error: "当前环境未绑定 D1，无法执行真实删除。",
    };
  }

  const existing = await env.DB.prepare(
    `SELECT id FROM photos WHERE id = ? LIMIT 1`,
  )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return {
      ok: false,
      deleted: false,
      persisted: true,
      error: "照片不存在或已被删除。",
    };
  }

  await deletePhotoObjects(env, id);
  await env.DB.prepare(`DELETE FROM photos WHERE id = ?`).bind(id).run();

  return {
    ok: true,
    deleted: true,
    persisted: true,
  };
}

export async function updatePhotoById(
  env: Env,
  id: string,
  payload: { description?: string; tags?: string[]; isHidden?: boolean },
) {
  if (!env.DB) {
    return {
      ok: false,
      persisted: false,
      error: "当前环境未绑定 D1，无法执行更新。",
    };
  }

  await ensurePhotoVisibilityColumn(env);

  const existing = await env.DB.prepare(
    `SELECT id FROM photos WHERE id = ? LIMIT 1`,
  )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return {
      ok: false,
      persisted: true,
      error: "照片不存在。",
    };
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (payload.description !== undefined) {
    updates.push("description = ?");
    values.push(payload.description);
  }

  if (payload.tags !== undefined) {
    updates.push("tags_json = ?");
    values.push(JSON.stringify(payload.tags));
  }

  if (payload.isHidden !== undefined) {
    updates.push("is_hidden = ?");
    values.push(payload.isHidden ? 1 : 0);
  }

  if (updates.length === 0) {
    return {
      ok: true,
      persisted: true,
    };
  }

  values.push(id);

  await env.DB.prepare(`UPDATE photos SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  return {
    ok: true,
    persisted: true,
  };
}
