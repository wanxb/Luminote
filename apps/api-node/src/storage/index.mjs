import { createLocalAssetStorage } from "./local-asset-storage.mjs";

export function createAssetStorage(config) {
  if (config.storageMode === "local") {
    return createLocalAssetStorage(config.uploadsDir);
  }

  return {
    async storePhotoAssets() {
      return { persisted: false };
    },
    async storeAvatarAsset() {
      return { persisted: false, fileName: "" };
    },
    async getPhotoAsset() {
      return null;
    },
    async getAvatarAsset() {
      return null;
    },
    async deleteAvatarAsset() {
      return;
    },
    async deletePhotoAssets() {
      return;
    },
  };
}
