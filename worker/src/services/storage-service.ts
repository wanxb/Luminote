import type { Env } from "../index";

type StoredVariant = "original" | "thumb" | "display" | "display-watermarked";
type AssetVariant = "display" | "thumb" | "display-watermarked" | "original";

function objectKey(id: string, variant: StoredVariant, extension = "jpg") {
  switch (variant) {
    case "thumb":
      return `thumbs/${id}.webp`;
    case "display":
      return `display/${id}.jpg`;
    case "display-watermarked":
      return `display-watermarked/${id}.jpg`;
    default:
      return `originals/${id}.${extension}`;
  }
}

function avatarObjectKey(fileName: string) {
  return `avatars/${fileName}`;
}

export async function storePhotoObjects(
  env: Env,
  payload: {
    id: string;
    original?: File;
    thumbnail?: File;
    display?: File;
    watermarkedDisplay?: File;
  },
) {
  if (!env.PHOTOS_BUCKET) {
    return {
      persisted: false,
      originalKey: "",
      thumbKey: "",
      displayKey: "",
      watermarkedDisplayKey: "",
    };
  }

  const originalExtension = payload.original
    ? inferExtension(payload.original.name)
    : "jpg";
  const originalKey = payload.original
    ? objectKey(payload.id, "original", originalExtension)
    : "";
  const thumbKey = objectKey(payload.id, "thumb");
  const displayKey = objectKey(payload.id, "display");
  const watermarkedDisplayKey = objectKey(payload.id, "display-watermarked");

  if (payload.original) {
    await env.PHOTOS_BUCKET.put(originalKey, payload.original.stream(), {
      httpMetadata: {
        contentType: payload.original.type || "application/octet-stream",
      },
    });
  }

  if (payload.thumbnail) {
    await env.PHOTOS_BUCKET.put(thumbKey, payload.thumbnail.stream(), {
      httpMetadata: {
        contentType: payload.thumbnail.type || "image/webp",
      },
    });
  }

  if (payload.display) {
    await env.PHOTOS_BUCKET.put(displayKey, payload.display.stream(), {
      httpMetadata: {
        contentType: payload.display.type || "image/jpeg",
      },
    });
  }

  if (payload.watermarkedDisplay) {
    await env.PHOTOS_BUCKET.put(
      watermarkedDisplayKey,
      payload.watermarkedDisplay.stream(),
      {
        httpMetadata: {
          contentType: payload.watermarkedDisplay.type || "image/jpeg",
        },
      },
    );
  }

  const [storedThumb, storedDisplay] = await Promise.all([
    payload.thumbnail ? env.PHOTOS_BUCKET.get(thumbKey) : Promise.resolve(null),
    payload.display ? env.PHOTOS_BUCKET.get(displayKey) : Promise.resolve(null),
  ]);

  if (
    (payload.thumbnail && !storedThumb) ||
    (payload.display && !storedDisplay)
  ) {
    return {
      persisted: false,
      originalKey: "",
      thumbKey: "",
      displayKey: "",
      watermarkedDisplayKey: "",
    };
  }

  return {
    persisted: true,
    originalKey,
    thumbKey: payload.thumbnail ? thumbKey : "",
    displayKey: payload.display ? displayKey : "",
    watermarkedDisplayKey: payload.watermarkedDisplay
      ? watermarkedDisplayKey
      : "",
  };
}

function inferExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "jpg";
}

export async function getPhotoObject(
  env: Env,
  variant: AssetVariant,
  id: string,
) {
  if (!env.PHOTOS_BUCKET) {
    return null;
  }

  if (variant === "thumb") {
    return env.PHOTOS_BUCKET.get(objectKey(id, "thumb"));
  }

  if (variant === "display") {
    return env.PHOTOS_BUCKET.get(objectKey(id, "display"));
  }

  if (variant === "original") {
    try {
      const originals = await env.PHOTOS_BUCKET.list({
        prefix: `originals/${id}.`,
        limit: 1,
      });
      const originalKey = originals.objects[0]?.key;
      return originalKey ? env.PHOTOS_BUCKET.get(originalKey) : null;
    } catch {
      return null;
    }
  }

  return env.PHOTOS_BUCKET.get(objectKey(id, "display-watermarked"));
}

export async function storePhotographerAvatar(env: Env, file: File) {
  if (!env.PHOTOS_BUCKET) {
    return {
      persisted: false,
      fileName: "",
    };
  }

  const extension = inferExtension(file.name);
  const fileName = `avatar_${Date.now()}_${crypto.randomUUID()}.${extension}`;

  await env.PHOTOS_BUCKET.put(avatarObjectKey(fileName), file.stream(), {
    httpMetadata: {
      contentType: file.type || "application/octet-stream",
    },
  });

  return {
    persisted: true,
    fileName,
  };
}

export async function getAvatarObject(env: Env, fileName: string) {
  if (!env.PHOTOS_BUCKET) {
    return null;
  }

  return env.PHOTOS_BUCKET.get(avatarObjectKey(fileName));
}

export async function deleteAvatarObject(env: Env, fileName: string) {
  if (!env.PHOTOS_BUCKET || !fileName) {
    return;
  }

  await env.PHOTOS_BUCKET.delete(avatarObjectKey(fileName));
}

export async function hasPhotoObjects(env: Env, id: string) {
  if (!env.PHOTOS_BUCKET) {
    return false;
  }

  const [thumb, display, watermarked, originals] = await Promise.all([
    env.PHOTOS_BUCKET.get(objectKey(id, "thumb")),
    env.PHOTOS_BUCKET.get(objectKey(id, "display")),
    env.PHOTOS_BUCKET.get(objectKey(id, "display-watermarked")),
    env.PHOTOS_BUCKET.list({
      prefix: `originals/${id}.`,
      limit: 1,
    }),
  ]);

  return Boolean(
    thumb || display || watermarked || originals.objects.length > 0,
  );
}

export async function deletePhotoObjects(env: Env, id: string) {
  if (!env.PHOTOS_BUCKET) {
    return;
  }

  const originals = await env.PHOTOS_BUCKET.list({
    prefix: `originals/${id}.`,
    limit: 100,
  });

  const keys = [
    ...originals.objects.map((object) => object.key),
    objectKey(id, "thumb"),
    objectKey(id, "display"),
    objectKey(id, "display-watermarked"),
  ];

  const uniqueKeys = Array.from(new Set(keys));

  await Promise.all(uniqueKeys.map((key) => env.PHOTOS_BUCKET!.delete(key)));
}
