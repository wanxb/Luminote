import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const VARIANT_FILE_MAP = {
  original: "",
  thumb: ".webp",
  display: ".jpg",
  "display-watermarked": ".jpg",
  avatar: "",
};

const VARIANT_DIR_MAP = {
  original: "originals",
  thumb: "thumbs",
  display: "display",
  "display-watermarked": "display-watermarked",
  avatar: "avatars",
};

function getAssetPath(rootDir, variant, idOrFileName) {
  const dir = VARIANT_DIR_MAP[variant];
  const ext = VARIANT_FILE_MAP[variant];

  if (variant === "avatar") {
    return path.join(rootDir, dir, idOrFileName);
  }

  if (variant === "original") {
    return path.join(rootDir, dir, idOrFileName);
  }

  return path.join(rootDir, dir, `${idOrFileName}${ext}`);
}

async function findOriginalAssetPath(rootDir, id) {
  const originalsDir = path.join(rootDir, VARIANT_DIR_MAP.original);

  try {
    const entries = await readdir(originalsDir);
    const matchedName = entries.find((entry) => entry.startsWith(`${id}.`));
    return matchedName ? path.join(originalsDir, matchedName) : null;
  } catch {
    return null;
  }
}

function getContentType(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".svg")) {
    return "image/svg+xml; charset=utf-8";
  }

  return "image/jpeg";
}

export function createLocalAssetStorage(rootDir) {
  return {
    async storePhotoAssets({ id, thumbnail, display, watermarkedDisplay, original }) {
      await Promise.all(
        Object.values(VARIANT_DIR_MAP).map((dir) =>
          mkdir(path.join(rootDir, dir), { recursive: true }),
        ),
      );

      if (thumbnail) {
        await writeFile(
          getAssetPath(rootDir, "thumb", id),
          Buffer.from(await thumbnail.arrayBuffer()),
        );
      }

      if (display) {
        await writeFile(
          getAssetPath(rootDir, "display", id),
          Buffer.from(await display.arrayBuffer()),
        );
      }

      if (watermarkedDisplay) {
        await writeFile(
          getAssetPath(rootDir, "display-watermarked", id),
          Buffer.from(await watermarkedDisplay.arrayBuffer()),
        );
      }

      let originalUrl = "";

      if (original) {
        const extension = original.name.split(".").pop() || "jpg";
        const originalPath = path.join(
          rootDir,
          "originals",
          `${id}.${extension}`,
        );
        await mkdir(path.join(rootDir, "originals"), { recursive: true });
        await writeFile(originalPath, Buffer.from(await original.arrayBuffer()));
        originalUrl = `/assets/original/${id}`;
      }

      try {
        await Promise.all(
          [
            thumbnail ? access(getAssetPath(rootDir, "thumb", id)) : undefined,
            display ? access(getAssetPath(rootDir, "display", id)) : undefined,
            watermarkedDisplay
              ? access(getAssetPath(rootDir, "display-watermarked", id))
              : undefined,
            original
              ? findOriginalAssetPath(rootDir, id).then((filePath) =>
                  filePath ? access(filePath) : Promise.reject(new Error("Missing original asset")),
                )
              : undefined,
          ].filter(Boolean),
        );
      } catch {
        await this.deletePhotoAssets(id);
        return {
          persisted: false,
          originalUrl: "",
        };
      }

      return {
        persisted: true,
        originalUrl,
      };
    },

    async getPhotoAsset(variant, id) {
      const filePath =
        variant === "original"
          ? await findOriginalAssetPath(rootDir, id)
          : getAssetPath(rootDir, variant, id);

      try {
        if (!filePath) {
          return null;
        }

        await access(filePath);
        const body = await readFile(filePath);

        return {
          body,
          contentType: getContentType(filePath),
        };
      } catch {
        return null;
      }
    },

    async getAvatarAsset(fileName) {
      const filePath = getAssetPath(rootDir, "avatar", fileName);

      try {
        await access(filePath);
        const body = await readFile(filePath);

        return {
          body,
          contentType: getContentType(filePath),
        };
      } catch {
        return null;
      }
    },

    async storeAvatarAsset(file) {
      await mkdir(path.join(rootDir, "avatars"), { recursive: true });
      const extension = file.name.split(".").pop() || "jpg";
      const fileName = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const targetPath = getAssetPath(rootDir, "avatar", fileName);
      await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

      return {
        persisted: true,
        fileName,
      };
    },

    async deleteAvatarAsset(fileName) {
      try {
        await rm(getAssetPath(rootDir, "avatar", fileName), { force: true });
      } catch {
        // Ignore missing files.
      }
    },

    async deletePhotoAssets(id) {
      const originalPath = await findOriginalAssetPath(rootDir, id);

      await Promise.all(
        ["thumb", "display", "display-watermarked"].map(async (variant) => {
          try {
            await rm(getAssetPath(rootDir, variant, id), { force: true });
          } catch {
            // Ignore missing files.
          }
        }),
      );

      if (originalPath) {
        try {
          await rm(originalPath, { force: true });
        } catch {
          // Ignore missing files.
        }
      }
    },
  };
}
