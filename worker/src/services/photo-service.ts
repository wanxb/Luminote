import type { Env } from "../index";
import { getLocaleMessages } from "../utils/i18n";
import { getSiteConfig } from "./site-config-service";
import {
  deletePhotoObjects,
  hasPhotoObjects,
  storePhotoObjects,
} from "./storage-service";

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
let ensurePhotoSourceHashColumnPromise: Promise<void> | null = null;

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
    params?: Record<string, string>;
  };
};

type CreatePhotoInput = {
  fileName: string;
  sourceHash?: string;
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

type CreatePhotosResult = {
  uploaded: CreatedPhoto[];
  failed: Array<{ fileName: string; error: string }>;
};

type ListPhotosOptions = {
  includeHidden?: boolean;
  page?: number;
  pageSize?: number;
};

export type ListPhotosResult = {
  items: Array<{
    id: string;
    thumbUrl: string;
    displayUrl: string;
    watermarkedDisplayUrl?: string;
    watermarkEnabled: boolean;
    isHidden: boolean;
    takenAt?: string;
    description?: string;
    tags: string[];
  }>;
  hasMore: boolean;
  total: number;
};

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 60;

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

function parseExifJson(exifJson: string | null) {
  if (!exifJson) {
    return {} as NonNullable<ExifPayload["exif"]>;
  }

  try {
    const parsed = JSON.parse(exifJson) as ExifPayload["exif"] | null;
    return parsed ?? {};
  } catch {
    return {} as NonNullable<ExifPayload["exif"]>;
  }
}

function isDateExifParam(key: string) {
  return /(date|time|timestamp)/i.test(key);
}

function isLocationExifParam(key: string) {
  return /(gps|latitude|longitude|altitude|location|mapdatum|bearing|speed|dest)/i.test(
    key,
  );
}

function filterExifParams(
  params: Record<string, string> | undefined,
  options: {
    showCameraInfo: boolean;
    showDateInfo: boolean;
    showLocationInfo: boolean;
  },
) {
  if (!params) {
    return undefined;
  }

  const filteredEntries = Object.entries(params).filter(([key]) => {
    const isDateParam = isDateExifParam(key);
    const isLocationParam = isLocationExifParam(key);

    if (isDateParam) {
      return options.showDateInfo;
    }

    if (isLocationParam) {
      return options.showLocationInfo;
    }

    return options.showCameraInfo;
  });

  return filteredEntries.length > 0
    ? Object.fromEntries(filteredEntries)
    : undefined;
}

function buildVisibleExif(
  rawExif: ExifPayload["exif"] | undefined,
  options: {
    showCameraInfo: boolean;
    showDateInfo: boolean;
    showLocationInfo: boolean;
  },
) {
  if (!rawExif) {
    return undefined;
  }

  const visibleExif: NonNullable<ExifPayload["exif"]> = {};

  if (options.showCameraInfo) {
    visibleExif.aperture = rawExif.aperture;
    visibleExif.shutter = rawExif.shutter;
    visibleExif.iso = rawExif.iso;
    visibleExif.focalLength = rawExif.focalLength;
  }

  if (options.showLocationInfo) {
    visibleExif.latitude = rawExif.latitude;
    visibleExif.longitude = rawExif.longitude;
  }

  visibleExif.params = filterExifParams(rawExif.params, options);

  return Object.keys(visibleExif).length > 0 ? visibleExif : undefined;
}

async function collectBucketPhotoItems(env: Env, origin: string) {
  if (!env.PHOTOS_BUCKET) {
    return [] as ListPhotosResult["items"];
  }

  let watermarkedObjects;
  let displayObjects;
  let thumbObjects;

  try {
    [watermarkedObjects, displayObjects, thumbObjects] = await Promise.all([
      env.PHOTOS_BUCKET.list({ prefix: "display-watermarked/", limit: 1000 }),
      env.PHOTOS_BUCKET.list({ prefix: "display/", limit: 1000 }),
      env.PHOTOS_BUCKET.list({ prefix: "thumbs/", limit: 1000 }),
    ]);
  } catch (error) {
    console.error("[listPhotosFromBucket] R2 list failed", error);
    throw error;
  }

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

async function listPhotosFromBucket(env: Env, origin: string) {
  const allItems = await collectBucketPhotoItems(env, origin);

  return paginatePhotoItems(allItems, DEFAULT_PAGE_SIZE, 0);
}

function normalizePage(page = 1) {
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function normalizePageSize(pageSize = DEFAULT_PAGE_SIZE) {
  if (!Number.isFinite(pageSize) || pageSize <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.floor(pageSize), MAX_PAGE_SIZE);
}

function paginatePhotoItems<T>(items: T[], pageSize: number, offset: number) {
  const paginatedItems = items.slice(offset, offset + pageSize + 1);

  return {
    items: paginatedItems.slice(0, pageSize),
    hasMore: paginatedItems.length > pageSize,
    total: items.length,
  };
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

async function ensurePhotoSourceHashColumn(env: Env) {
  if (!env.DB) {
    return;
  }

  if (!ensurePhotoSourceHashColumnPromise) {
    ensurePhotoSourceHashColumnPromise = (async () => {
      try {
        await env
          .DB!.prepare("ALTER TABLE photos ADD COLUMN source_hash TEXT")
          .run();
      } catch {
        // Ignore if the column already exists.
      }

      try {
        await env
          .DB!.prepare(
            "CREATE INDEX IF NOT EXISTS idx_photos_source_hash ON photos(source_hash)",
          )
          .run();
      } catch {
        // Ignore if the database is managed elsewhere.
      }
    })();
  }

  await ensurePhotoSourceHashColumnPromise;
}

async function findExistingSourceHashes(env: Env, hashes: string[]) {
  if (!env.DB || hashes.length === 0) {
    return new Set<string>();
  }

  const placeholders = hashes.map(() => "?").join(", ");
  const result = await env.DB.prepare(
    `SELECT source_hash FROM photos WHERE source_hash IN (${placeholders})`,
  )
    .bind(...hashes)
    .all<{ source_hash: string | null }>();

  return new Set(
    (result.results ?? [])
      .map((row) => row.source_hash)
      .filter((hash): hash is string => Boolean(hash)),
  );
}

export async function listPhotos(
  env: Env,
  origin: string,
  tag: string | null = null,
  options?: ListPhotosOptions,
): Promise<ListPhotosResult> {
  const page = normalizePage(options?.page);
  const pageSize = normalizePageSize(options?.pageSize);
  const offset = (page - 1) * pageSize;

  if (!env.DB) {
    if (tag) {
      return {
        items: [],
        hasMore: false,
        total: 0,
      };
    }

    const bucketItems = await collectBucketPhotoItems(env, origin);
    return paginatePhotoItems(bucketItems, pageSize, offset);
  }

  await ensurePhotoVisibilityColumn(env);

  const conditions: string[] = [];
  const values: unknown[] = [];
  const countValues: unknown[] = [];

  let query = `SELECT id, thumb_url, display_url, watermarked_display_url, watermark_enabled, is_hidden, taken_at, description, tags_json
     FROM photos`;

  if (!options?.includeHidden) {
    conditions.push("is_hidden = 0");
  }

  if (tag) {
    conditions.push("tags_json LIKE ?");
    values.push(`%${tag}%`);
    countValues.push(`%${tag}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  let countQuery = "SELECT COUNT(*) as count FROM photos";

  if (conditions.length > 0) {
    countQuery += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;

  const fallbackToBucket = async () => {
    if (tag) {
      return {
        items: [] as ListPhotosResult["items"],
        hasMore: false,
        total: 0,
      };
    }

    try {
      const bucketItems = await collectBucketPhotoItems(env, origin);
      return paginatePhotoItems(bucketItems, pageSize, offset);
    } catch (error) {
      console.error("[listPhotos] bucket fallback failed", error);
      return {
        items: [],
        hasMore: false,
        total: 0,
      };
    }
  };

  try {
    let statement = env.DB.prepare(query);
    let countStatement = env.DB.prepare(countQuery);

    values.push(pageSize + 1, offset);

    if (values.length > 0) {
      statement = statement.bind(...values);
    }

    if (countValues.length > 0) {
      countStatement = countStatement.bind(...countValues);
    }

    const [result, countResult] = await Promise.all([
      statement.all<PersistedPhotoRow>(),
      countStatement.first<{ count: number }>(),
    ]);
    const rows = result.results ?? [];
    const total = countResult?.count ?? 0;

    if (rows.length === 0 && !tag && page === 1) {
      return fallbackToBucket();
    }

    const items = rows.slice(0, pageSize).map((row) => ({
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

    return {
      items,
      hasMore: rows.length > pageSize,
      total,
    };
  } catch (error) {
    console.error("[listPhotos] D1 query failed, falling back to R2", error);
    return fallbackToBucket();
  }
}

export async function getPhotoById(
  env: Env,
  origin: string,
  id: string,
  options?: { includeHidden?: boolean },
) {
  if (!env.DB) {
    const bucketPhotos = await collectBucketPhotoItems(env, origin);
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
    const bucketPhotos = await collectBucketPhotoItems(env, origin);
    const bucketPhoto = bucketPhotos.find((photo) => photo.id === id);
    return bucketPhoto ? { ...bucketPhoto, tags: [] } : null;
  }

  if (!row) {
    const bucketPhotos = await collectBucketPhotoItems(env, origin);
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
    takenAt: row.show_date_info ? (row.taken_at ?? undefined) : undefined,
    description: row.description ?? undefined,
    device: row.show_camera_info ? (row.device ?? undefined) : undefined,
    lens: row.show_camera_info ? (row.lens ?? undefined) : undefined,
    location: row.show_location_info ? (row.location ?? undefined) : undefined,
    exif: buildVisibleExif(parseExifJson(row.exif_json), {
      showCameraInfo: Boolean(row.show_camera_info),
      showDateInfo: Boolean(row.show_date_info),
      showLocationInfo: Boolean(row.show_location_info),
    }),
    tags: parseTagsJson(row.tags_json),
  };
}

export async function createPhotos(
  env: Env,
  origin: string,
  inputs: CreatePhotoInput[],
): Promise<CreatePhotosResult> {
  if (inputs.length === 0) {
    return {
      uploaded: [],
      failed: [],
    };
  }

  if (!env.DB) {
    return {
      uploaded: inputs.map((input, index) => ({
        id: createPhotoId(index),
        fileName: input.fileName,
        watermarkEnabled: input.watermarkEnabled,
        tags: input.tags,
        persisted: false,
      })),
      failed: [],
    };
  }

  await ensurePhotoVisibilityColumn(env);
  await ensurePhotoSourceHashColumn(env);
  const t = getLocaleMessages((await getSiteConfig(env)).locale);

  const existingHashes = await findExistingSourceHashes(
    env,
    inputs.map((input) => input.sourceHash?.trim() ?? "").filter(Boolean),
  );
  const seenHashes = new Set(existingHashes);
  const acceptedInputs: CreatePhotoInput[] = [];
  const failed: CreatePhotosResult["failed"] = [];

  for (const input of inputs) {
    const normalizedHash = input.sourceHash?.trim();

    if (normalizedHash && seenHashes.has(normalizedHash)) {
      failed.push({
        fileName: input.fileName,
        error: t.duplicatePhotoSkipped,
      });
      continue;
    }

    if (normalizedHash) {
      seenHashes.add(normalizedHash);
    }

    acceptedInputs.push(input);
  }

  if (acceptedInputs.length === 0) {
    return {
      uploaded: [],
      failed,
    };
  }

  const created: CreatedPhoto[] = acceptedInputs.map((input, index) => ({
    id: createPhotoId(index),
    fileName: input.fileName,
    watermarkEnabled: input.watermarkEnabled,
    tags: input.tags,
    persisted: true,
  }));

  const createdAt = new Date().toISOString();
  const storageResults = await Promise.all(
    created.map((photo, index) =>
      storePhotoObjects(env, {
        id: photo.id,
        original: acceptedInputs[index].originalFile,
        thumbnail: acceptedInputs[index].thumbnail,
        display: acceptedInputs[index].displayFile,
        watermarkedDisplay: acceptedInputs[index].watermarkedDisplayFile,
      }),
    ),
  );
  const statements = created.map((photo, index) => {
    const input = acceptedInputs[index];
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
        source_hash,
        exif_json,
        tags_json,
        is_hidden,
        show_camera_info,
        show_date_info,
        show_location_info,
        watermark_enabled,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        input.sourceHash?.trim() || null,
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

  return {
    uploaded: created,
    failed,
  };
}

export async function deletePhotoById(env: Env, id: string) {
  const t = getLocaleMessages((await getSiteConfig(env)).locale);

  if (!env.DB) {
    const bucketOnlyPhotoExists = await hasPhotoObjects(env, id);

    if (!bucketOnlyPhotoExists) {
      return {
        ok: false,
        deleted: false,
        persisted: false,
        error: t.photoMissingOrDeleted,
      };
    }

    await deletePhotoObjects(env, id);

    return {
      ok: true,
      deleted: true,
      persisted: false,
    };
  }

  const existing = await env.DB.prepare(
    `SELECT id FROM photos WHERE id = ? LIMIT 1`,
  )
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    const bucketOnlyPhotoExists = await hasPhotoObjects(env, id);

    if (bucketOnlyPhotoExists) {
      await deletePhotoObjects(env, id);

      return {
        ok: true,
        deleted: true,
        persisted: false,
      };
    }

    return {
      ok: false,
      deleted: false,
      persisted: true,
      error: t.photoMissingOrDeleted,
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
  const t = getLocaleMessages((await getSiteConfig(env)).locale);

  if (!env.DB) {
    return {
      ok: false,
      persisted: false,
      error: t.d1UpdateMissing,
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
      error: t.photoNotFound,
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

export async function getPhotoCount(env: Env) {
  if (!env.DB) {
    return 0;
  }

  const result = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM photos",
  ).first<{ count: number }>();

  return result?.count ?? 0;
}
