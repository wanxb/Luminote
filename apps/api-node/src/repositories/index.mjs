import { createFilePublicContentRepository } from "./file-public-content-repository.mjs";
import { createMutableFileContentRepository } from "./mutable-file-content-repository.mjs";
import { createInMemoryPublicContentRepository } from "./public-content-repository.mjs";
import { createSqliteAdminContentRepository } from "./sqlite-admin-content-repository.mjs";
import { createSqlitePublicContentRepository } from "./sqlite-public-content-repository.mjs";

export function createPublicContentRepository(config) {
  if (config.persistenceDriver === "sqlite") {
    return createSqlitePublicContentRepository(config);
  }

  if (config.contentSource === "file") {
    return createFilePublicContentRepository({
      baseUrl: config.publicBaseUrl,
      filePath: config.dataFile,
    });
  }

  return createInMemoryPublicContentRepository(config.publicBaseUrl);
}

export function createAdminContentRepository(config) {
  if (config.persistenceDriver === "sqlite") {
    return createSqliteAdminContentRepository(config);
  }

  if (config.contentSource === "file") {
    return createMutableFileContentRepository({
      filePath: config.dataFile,
      baseUrl: config.publicBaseUrl,
    });
  }

  return {
    async getSiteSettings() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async listTags() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async createPhoto() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async listAdminPhotos() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async updatePhoto() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async attachOriginalAsset() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async deletePhoto() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async updateSite() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async createTag() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
    async deleteTag() {
      throw new Error("Admin write operations require CONTENT_SOURCE=file");
    },
  };
}
