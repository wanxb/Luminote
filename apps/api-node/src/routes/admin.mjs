import { appendSessionCookie, clearSessionCookie, isAuthenticated } from "../auth/session.mjs";
import { readFormData } from "../utils/form-data.mjs";
import { readJsonBody } from "../utils/request-body.mjs";

function unauthorized(sendJson, res, message = "Unauthorized") {
  sendJson(res, 401, {
    ok: false,
    error: message,
  });
}

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
      unauthorized(sendJson, res, "Invalid admin password.");
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
    unauthorized(sendJson, res, "Please log in first.");
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
    const watermarkEnabled = String(formData.get("watermarkEnabled") || "false") === "true";
    const photoDraftsRaw = formData.get("photoDrafts");
    const photoDrafts =
      typeof photoDraftsRaw === "string" ? JSON.parse(photoDraftsRaw) : [];

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

        await assetStorage.storePhotoAssets({
          id: created.id,
          original: originalFiles[index],
          thumbnail: thumbnails[index],
          display: displayFiles[index],
          watermarkedDisplay: watermarkedDisplayFiles[index] ?? undefined,
        });

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
    await repository.updateSite(body);
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
      sendJson(res, 400, {
        ok: false,
        error: "Please choose an avatar image.",
      });
      return true;
    }

    if (!String(file.type || "").startsWith("image/")) {
      sendJson(res, 400, {
        ok: false,
        error: "Avatar must be an image file.",
      });
      return true;
    }

    const stored = await assetStorage.storeAvatarAsset(file);

    if (!stored.persisted || !stored.fileName) {
      sendJson(res, 400, {
        ok: false,
        error: "Avatar upload failed.",
      });
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
    const tag = await repository.createTag(body.name);
    sendJson(res, 200, {
      ok: true,
      tag,
    });
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
    const result = await repository.updatePhoto(id, body);
    sendJson(res, result.ok ? 200 : 404, result);
    return true;
  }

  if (url.pathname.startsWith("/api/admin/photos/") && req.method === "DELETE") {
    const id = decodeURIComponent(url.pathname.slice("/api/admin/photos/".length));
    const result = await repository.deletePhoto(id);
    if (result.ok) {
      await assetStorage.deletePhotoAssets(id);
    }
    sendJson(res, result.ok ? 200 : 404, result);
    return true;
  }

  sendJson(res, 501, {
    ok: false,
    error: "Admin route scaffolded but not implemented",
  });
  return true;
}
