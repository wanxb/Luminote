function objectKey(id, variant, extension = "jpg") {
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
function avatarObjectKey(fileName) {
    return `avatars/${fileName}`;
}
export async function storePhotoObjects(env, payload) {
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
        await env.PHOTOS_BUCKET.put(watermarkedDisplayKey, payload.watermarkedDisplay.stream(), {
            httpMetadata: {
                contentType: payload.watermarkedDisplay.type || "image/jpeg",
            },
        });
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
function inferExtension(name) {
    const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
    return match?.[1] ?? "jpg";
}
export async function getPhotoObject(env, variant, id) {
    if (!env.PHOTOS_BUCKET) {
        return null;
    }
    if (variant === "thumb") {
        return env.PHOTOS_BUCKET.get(objectKey(id, "thumb"));
    }
    if (variant === "display") {
        return env.PHOTOS_BUCKET.get(objectKey(id, "display"));
    }
    return env.PHOTOS_BUCKET.get(objectKey(id, "display-watermarked"));
}
export async function storePhotographerAvatar(env, file) {
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
export async function getAvatarObject(env, fileName) {
    if (!env.PHOTOS_BUCKET) {
        return null;
    }
    return env.PHOTOS_BUCKET.get(avatarObjectKey(fileName));
}
export async function deleteAvatarObject(env, fileName) {
    if (!env.PHOTOS_BUCKET || !fileName) {
        return;
    }
    await env.PHOTOS_BUCKET.delete(avatarObjectKey(fileName));
}
export async function deletePhotoObjects(env, id) {
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
    await Promise.all(uniqueKeys.map((key) => env.PHOTOS_BUCKET.delete(key)));
}
