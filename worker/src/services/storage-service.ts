import type { Env } from "../index";

type StoredVariant = "original" | "thumb";
type AssetVariant = "display" | "thumb";

function objectKey(id: string, variant: StoredVariant, extension = "jpg") {
  if (variant === "thumb") {
    return `thumbs/${id}.webp`;
  }

  return `originals/${id}.${extension}`;
}

function inferExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "jpg";
}

export async function storePhotoObjects(
  env: Env,
  payload: {
    id: string;
    original: File;
    thumbnail?: File;
  }
) {
  if (!env.PHOTOS_BUCKET) {
    return {
      persisted: false,
      originalKey: "",
      thumbKey: ""
    };
  }

  const originalExtension = inferExtension(payload.original.name);
  const originalKey = objectKey(payload.id, "original", originalExtension);
  const thumbKey = objectKey(payload.id, "thumb");

  await env.PHOTOS_BUCKET.put(originalKey, payload.original.stream(), {
    httpMetadata: {
      contentType: payload.original.type || "application/octet-stream"
    }
  });

  if (payload.thumbnail) {
    await env.PHOTOS_BUCKET.put(thumbKey, payload.thumbnail.stream(), {
      httpMetadata: {
        contentType: payload.thumbnail.type || "image/webp"
      }
    });
  }

  return {
    persisted: true,
    originalKey,
    thumbKey: payload.thumbnail ? thumbKey : ""
  };
}

export async function getPhotoObject(env: Env, variant: AssetVariant, id: string) {
  if (!env.PHOTOS_BUCKET) {
    return null;
  }

  if (variant === "thumb") {
    return env.PHOTOS_BUCKET.get(objectKey(id, "thumb"));
  }

  const originals = await env.PHOTOS_BUCKET.list({
    prefix: `originals/${id}.`,
    limit: 1
  });

  const object = originals.objects[0];

  if (!object) {
    return null;
  }

  return env.PHOTOS_BUCKET.get(object.key);
}
