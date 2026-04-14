import { appendSessionCookie, clearSessionCookie, isAuthenticated } from "../auth/session.mjs";
import {
  validateUploadCount,
} from "../domain/validation.mjs";
import {
  resolveMutationStatus,
  sendUnauthorized,
  sendValidationError,
} from "../utils/http-response.mjs";
import { readFormData } from "../utils/form-data.mjs";
import { readJsonBody } from "../utils/request-body.mjs";

export async function handleAdminRoute({
  req,
  res,
  url,
  config,
  repository,
  assetStorage,
  sendJson,
}) {
  if (url.pathname === "/api/admin/session" && req.method === "GET") {
    const authenticated = isAuthenticated(req, config);

    if (authenticated) {
      appendSessionCookie(res, req, config);
    }

    sendJson(res, 200, {
      ok: true,
      authenticated,
    });
    return true;
  }

  if (url.pathname === "/api/admin/login" && req.method === "POST") {
    const body = await readJsonBody(req);

    if (!body.password || body.password !== config.adminPassword) {
      sendUnauthorized(res, "Invalid admin password.");
      return true;
    }

    appendSessionCookie(res, req, config);
    sendJson(res, 200, {
      ok: true,
      authenticated: true,
    });
    return true;
  }

  if (url.pathname === "/api/admin/logout" && req.method === "POST") {
    clearSessionCookie(res, req, config);
    sendJson(res, 200, {
      ok: true,
    });
    return true;
  }

  if (!url.pathname.startsWith("/api/admin/")) {
    return false;
  }

  if (!isAuthenticated(req, config)) {
    sendUnauthorized(res, "Please log in first.");
    return true;
  }

  if (url.pathname === "/api/admin/photos" && req.method === "GET") {
    const tag = url.searchParams.get("tag");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") || "30"));
    const result = await repository.listAdminPhotos({
      tag,
      page,
      pageSize,
    });

    sendJson(res, 200, {
      items: result.items,
      page,
      pageSize,
      hasMore: result.hasMore,
      total: result.total,
      unfilteredTotal: result.unfilteredTotal,
    });
    return true;
  }

  if (url.pathname === "/api/admin/photos" && req.method === "POST") {
    const formData = await readFormData(req);
    const fileNames = JSON.parse(String(formData.get("fileNames") || "[]"));
    const sourceHashes = JSON.parse(String(formData.get("sourceHashes") || "[]"));
    const tags = JSON.parse(String(formData.get("tags") || "[]"));
    const thumbnails = formData
      .getAll("thumbnails[]")
      .filter((item) => item instanceof File);
    const displayFiles = formData
      .getAll("displayFiles[]")
      .filter((item) => item instanceof File);
    const watermarkedDisplayFiles = formData
      .getAll("watermarkedDisplayFiles[]")
      .map((item) => (item instanceof File && item.size > 0 ? item : null));
    const originalFiles = formData
      .getAll("files[]")
      .filter((item) => item instanceof File);
    const exifRecords = formData.getAll("exif[]").map((item) => {
      if (typeof item !== "string") {
        return {};
      }

      try {
        return JSON.parse(item);
      } catch {
        return {};
      }
    });
    const description = String(formData.get("description") || "");
    const storeOriginalFiles = String(formData.get("storeOriginalFiles") || "false") === "true";
    const watermarkEnabled = String(formData.get("watermarkEnabled") || "false") === "true";
    const photoDraftsRaw = formData.get("photoDrafts");
    const photoDrafts =
      typeof photoDraftsRaw === "string" ? JSON.parse(photoDraftsRaw) : [];
    const siteSettings = await repository.getSiteSettings();
    const shouldStoreOriginalFiles =
      Boolean(siteSettings.uploadOriginalEnabled) && storeOriginalFiles;

    try {
      validateUploadCount(fileNames.length, siteSettings.maxUploadFiles || 20);
    } catch (error) {
      sendValidationError(
        res,
        error instanceof Error ? error.message : "Upload validation failed.",
        {
          uploaded: [],
          failed: [],
        },
      );
      return true;
    }

    const uploaded = [];
    const failed = [];

    for (let index = 0; index < fileNames.length; index += 1) {
      const fileName = String(fileNames[index] || `upload_${index + 1}.jpg`);
      const exif = exifRecords[index] || {};
      const draft = Array.isArray(photoDrafts) ? photoDrafts[index] || {} : {};

      try {
        const created = await repository.createPhoto({
          fileName,
          description: draft.description ?? description,
          tags: draft.tags ?? tags,
          sourceHash: sourceHashes[index],
          watermarkEnabled,
          takenAt: exif.takenAt,
          device: exif.device,
          lens: exif.lens,
          location: exif.location,
          exif: exif.exif,
        });

        const storedAssets = await assetStorage.storePhotoAssets({
          id: created.id,
          original: shouldStoreOriginalFiles ? originalFiles[index] : undefined,
          thumbnail: thumbnails[index],
          display: displayFiles[index],
          watermarkedDisplay: watermarkedDisplayFiles[index] ?? undefined,
        });

        if (storedAssets.originalUrl) {
          await repository.attachOriginalAsset(created.id, {
            originalFileName: fileName,
            originalUrl: storedAssets.originalUrl,
          });
        }

        uploaded.push(created);
      } catch (error) {
        failed.push({
          fileName,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }

    sendJson(res, 200, {
      ok: true,
      uploaded,
      failed,
    });
    return true;
  }

  if (url.pathname === "/api/admin/site" && req.method === "PATCH") {
    const body = await readJsonBody(req);
    try {
      await repository.updateSite(body);
    } catch (error) {
      sendValidationError(
        res,
        error instanceof Error ? error.message : "Site update failed.",
      );
      return true;
    }
    sendJson(res, 200, {
      ok: true,
      message: "Site configuration updated.",
    });
    return true;
  }

  if (url.pathname === "/api/admin/site/avatar" && req.method === "POST") {
    const formData = await readFormData(req);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      sendValidationError(res, "Please choose an avatar image.");
      return true;
    }

    if (!String(file.type || "").startsWith("image/")) {
      sendValidationError(res, "Avatar must be an image file.");
      return true;
    }

    const stored = await assetStorage.storeAvatarAsset(file);

    if (!stored.persisted || !stored.fileName) {
      sendValidationError(res, "Avatar upload failed.");
      return true;
    }

    const avatarUrl = `/assets/avatar/${encodeURIComponent(stored.fileName)}`;
    await repository.updateSite({
      photographerAvatarUrl: avatarUrl,
    });

    sendJson(res, 200, {
      ok: true,
      url: new URL(avatarUrl, config.publicBaseUrl).toString(),
    });
    return true;
  }

  if (url.pathname === "/api/admin/tags" && req.method === "GET") {
    const tags = await repository.listTags();

    sendJson(res, 200, {
      ok: true,
      tags,
    });
    return true;
  }

  if (url.pathname === "/api/admin/tags" && req.method === "POST") {
    const body = await readJsonBody(req);
    try {
      const tag = await repository.createTag(body.name);
      sendJson(res, 200, {
        ok: true,
        tag,
      });
    } catch (error) {
      sendValidationError(
        res,
        error instanceof Error ? error.message : "Tag creation failed.",
      );
    }
    return true;
  }

  if (url.pathname.startsWith("/api/admin/tags/") && req.method === "DELETE") {
    const name = decodeURIComponent(url.pathname.slice("/api/admin/tags/".length));
    const result = await repository.deleteTag(name);
    sendJson(res, 200, result);
    return true;
  }

  if (url.pathname.startsWith("/api/admin/photos/") && req.method === "PATCH") {
    const id = decodeURIComponent(url.pathname.slice("/api/admin/photos/".length));
    const body = await readJsonBody(req);
    try {
      const result = await repository.updatePhoto(id, body);
      sendJson(res, resolveMutationStatus(result), result);
    } catch (error) {
      sendValidationError(
        res,
        error instanceof Error ? error.message : "Photo update failed.",
      );
    }
    return true;
  }

  if (url.pathname.startsWith("/api/admin/photos/") && req.method === "DELETE") {
    const id = decodeURIComponent(url.pathname.slice("/api/admin/photos/".length));
    const result = await repository.deletePhoto(id);
    if (result.ok) {
      await assetStorage.deletePhotoAssets(id);
    }
    sendJson(res, resolveMutationStatus(result), result);
    return true;
  }

  sendJson(res, 501, {
    ok: false,
    error: "Admin route scaffolded but not implemented",
  });
  return true;
}
