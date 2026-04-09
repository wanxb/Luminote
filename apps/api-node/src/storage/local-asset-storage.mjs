import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const VARIANT_FILE_MAP = {
  thumb: ".webp",
  display: ".jpg",
  "display-watermarked": ".jpg",
  avatar: "",
};

const VARIANT_DIR_MAP = {
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

  return path.join(rootDir, dir, `${idOrFileName}${ext}`);
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

      if (original) {
        const originalPath = path.join(
          rootDir,
          "originals",
          `${id}.${original.name.split(".").pop() || "jpg"}`,
        );
        await mkdir(path.join(rootDir, "originals"), { recursive: true });
        await writeFile(originalPath, Buffer.from(await original.arrayBuffer()));
      }

      return {
        persisted: true,
      };
    },

    async getPhotoAsset(variant, id) {
      const filePath = getAssetPath(rootDir, variant, id);

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
      await Promise.all(
        ["thumb", "display", "display-watermarked"].map(async (variant) => {
          try {
            await rm(getAssetPath(rootDir, variant, id), { force: true });
          } catch {
            // Ignore missing files.
          }
        }),
      );
    },
  };
}
