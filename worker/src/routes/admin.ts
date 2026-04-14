import type { Env } from "../index";
import {
  createPhotos,
  deletePhotoById,
  getPhotoCount,
  listPhotos,
  updatePhotoById,
} from "../services/photo-service";
import {
  getSiteConfig,
  updateSiteConfig,
  verifyAdminPassword,
} from "../services/site-config-service";
import {
  deleteAvatarObject,
  storePhotographerAvatar,
} from "../services/storage-service";
import {
  getTagPool,
  createTag as createTagService,
  deleteTag as deleteTagService,
} from "../services/tag-service";
import { getLocaleMessages } from "../utils/i18n";
import {
  clearFailedLoginAttempts,
  getLoginRateLimit,
  recordFailedLoginAttempt,
} from "../utils/login-rate-limit";
import { TEXT_LIMITS, isWithinTextLimit } from "../utils/text-limits";
import { json } from "../utils/json";
import { handleSite } from "./site";

const sessionCookieName = "luminote_admin_session";
const sessionIdleTimeoutSeconds = 60 * 60 * 2;

function resolveSameSite(value: string | undefined) {
  const normalized = (value ?? "Lax").trim().toLowerCase();

  if (normalized === "strict") {
    return "Strict";
  }

  if (normalized === "none") {
    return "None";
  }

  return "Lax";
}

function shouldUseSecureCookie(
  request: Request,
  env: Env,
  sameSite: "Lax" | "Strict" | "None",
) {
  const secureMode = (env.ADMIN_COOKIE_SECURE ?? "auto").trim().toLowerCase();

  if (secureMode === "true") {
    return true;
  }

  if (secureMode === "false") {
    return sameSite === "None";
  }

  const url = new URL(request.url);
  return sameSite === "None" || url.protocol === "https:";
}

function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function unauthorized(message = "Unauthorized") {
  return json(
    {
      ok: false,
      error: message,
    },
    { status: 401 },
  );
}

function tooManyRequests(message: string, retryAfterSeconds: number) {
  return json(
    {
      ok: false,
      error: message,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

async function getRequestMessages(env: Env) {
  const siteConfig = await getSiteConfig(env);
  return getLocaleMessages(siteConfig.locale);
}

function getSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return "";
  }

  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const target = cookies.find((item) =>
    item.startsWith(`${sessionCookieName}=`),
  );

  if (!target) {
    return "";
  }

  return decodeURIComponent(target.slice(`${sessionCookieName}=`.length));
}

function createSessionCookie(request: Request, env: Env) {
  const sameSite = resolveSameSite(env.ADMIN_COOKIE_SAME_SITE);
  const isSecure = shouldUseSecureCookie(request, env, sameSite);

  return [
    `${sessionCookieName}=${encodeURIComponent(env.ADMIN_SESSION_TOKEN)}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    isSecure ? "Secure" : "",
    `Max-Age=${sessionIdleTimeoutSeconds}`,
  ]
    .filter(Boolean)
    .join("; ");
}

function clearSessionCookie(request: Request, env: Env) {
  const sameSite = resolveSameSite(env.ADMIN_COOKIE_SAME_SITE);
  const isSecure = shouldUseSecureCookie(request, env, sameSite);

  return [
    `${sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
    isSecure ? "Secure" : "",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
}

function isAuthenticated(request: Request, env: Env) {
  const token = getSessionToken(request);
  return Boolean(token && token === env.ADMIN_SESSION_TOKEN);
}

function parseTagsInput(
  rawValue: FormDataEntryValue | null,
  maxTagsPerPhoto: number,
) {
  if (typeof rawValue !== "string") {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (Array.isArray(parsed)) {
      return Array.from(
        new Set(parsed.map((tag) => String(tag).trim()).filter(Boolean)),
      ).slice(0, maxTagsPerPhoto);
    }
  } catch {
    // Fallback to comma-separated tags for older clients.
  }

  return rawValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index)
    .slice(0, maxTagsPerPhoto);
}

function parseFileNames(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    return [];
  }

  return [];
}

function parseSourceHashes(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim());
    }
  } catch {
    return [];
  }

  return [];
}

function parsePhotoDrafts(
  rawValue: FormDataEntryValue | null,
  maxTagsPerPhoto: number,
) {
  if (typeof rawValue !== "string") {
    return [] as Array<{ description?: string; tags: string[] }>;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => {
      if (!item || typeof item !== "object") {
        return { tags: [] };
      }

      const draft = item as { description?: unknown; tags?: unknown };

      return {
        description:
          typeof draft.description === "string" ? draft.description : undefined,
        tags: Array.isArray(draft.tags)
          ? Array.from(
              new Set(
                draft.tags.map((tag) => String(tag).trim()).filter(Boolean),
              ),
            ).slice(0, maxTagsPerPhoto)
          : [],
      };
    });
  } catch {
    return [];
  }
}

function hasTagLengthOverflow(tags: string[]) {
  return tags.some((tag) => tag.length > TEXT_LIMITS.tagName);
}

function extractAvatarFileName(avatarUrl: string) {
  try {
    const pathname = avatarUrl.startsWith("http")
      ? new URL(avatarUrl).pathname
      : avatarUrl;

    if (!pathname.startsWith("/assets/avatar/")) {
      return "";
    }

    return decodeURIComponent(pathname.slice("/assets/avatar/".length));
  } catch {
    return "";
  }
}

function resolvePublicAssetUrl(request: Request, assetUrl: string) {
  const trimmed = assetUrl.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return new URL(trimmed, request.url).toString();
}

export async function handleAdmin(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/admin/session" && request.method === "GET") {
    const authenticated = isAuthenticated(request, env);
    const response = json({
      ok: true,
      authenticated,
    });

    if (authenticated) {
      response.headers.append("set-cookie", createSessionCookie(request, env));
    }

    return response;
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const rateLimit = getLoginRateLimit(request);
    const t = await getRequestMessages(env);

    if (rateLimit.blocked) {
      return tooManyRequests(t.tooManyRequests ?? "Too many login attempts.", rateLimit.retryAfterSeconds);
    }

    const body = (await request.json()) as { password?: string };

    if (!body.password || !(await verifyAdminPassword(env, body.password))) {
      const blocked = recordFailedLoginAttempt(request);

      if (blocked.retryAfterSeconds > 0) {
        return tooManyRequests(t.tooManyRequests ?? "Too many login attempts.", blocked.retryAfterSeconds);
      }

      return unauthorized(t.adminPasswordIncorrect);
    }

    clearFailedLoginAttempts(request);

    const response = json({
      ok: true,
      authenticated: true,
    });
    response.headers.append("set-cookie", createSessionCookie(request, env));
    return response;
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    const response = json({
      ok: true,
    });
    response.headers.append("set-cookie", clearSessionCookie(request, env));
    return response;
  }

  if (url.pathname === "/api/admin/photos" && request.method === "POST") {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    const siteConfig = await getSiteConfig(env);
    const t = getLocaleMessages(siteConfig.locale);
    const formData = await request.formData();
    const legacyFiles = formData
      .getAll("files[]")
      .filter((entry): entry is File => entry instanceof File);
    const fileNames = parseFileNames(formData.get("fileNames"));
    const sourceHashes = parseSourceHashes(formData.get("sourceHashes"));
    const thumbnails = formData
      .getAll("thumbnails[]")
      .filter((entry): entry is File => entry instanceof File);
    const displayFiles = formData
      .getAll("displayFiles[]")
      .filter((entry): entry is File => entry instanceof File);
    const watermarkedDisplayFiles = formData
      .getAll("watermarkedDisplayFiles[]")
      .map((entry) =>
        entry instanceof File && entry.size > 0 ? entry : undefined,
      );
    const exifRecords = formData.getAll("exif[]").map((entry) => {
      if (typeof entry !== "string") {
        return {};
      }

      try {
        return JSON.parse(entry) as {
          takenAt?: string;
          device?: string;
          lens?: string;
          location?: string;
          exif?: Record<string, unknown>;
        };
      } catch {
        return {};
      }
    });
    const watermarkEnabled = formData.get("watermarkEnabled") === "true";
    const storeOriginalFiles = formData.get("storeOriginalFiles") === "true";
    const description = String(formData.get("description") ?? "");
    const showDateInfo = formData.get("showDateInfo") === "true";
    const showCameraInfo = formData.get("showCameraInfo") === "true";
    const showLocationInfo = formData.get("showLocationInfo") === "true";
    const tags = parseTagsInput(
      formData.get("tags"),
      siteConfig.maxTagsPerPhoto,
    );
    const photoDrafts = parsePhotoDrafts(
      formData.get("photoDrafts"),
      siteConfig.maxTagsPerPhoto,
    );
    const normalizedFileNames =
      fileNames.length > 0 ? fileNames : legacyFiles.map((file) => file.name);

    if (!isWithinTextLimit(description.trim(), TEXT_LIMITS.photoDescription)) {
      return json(
        {
          ok: false,
          uploaded: [],
          failed: [],
          error: t.photoDescriptionTooLong(TEXT_LIMITS.photoDescription),
        },
        { status: 400 },
      );
    }

    if (hasTagLengthOverflow(tags)) {
      return json(
        {
          ok: false,
          uploaded: [],
          failed: [],
          error: t.tagTooLong(TEXT_LIMITS.tagName),
        },
        { status: 400 },
      );
    }

    if (
      photoDrafts.some(
        (draft) =>
          (draft.description &&
            !isWithinTextLimit(
              draft.description.trim(),
              TEXT_LIMITS.photoDescription,
            )) ||
          hasTagLengthOverflow(draft.tags),
      )
    ) {
      return json(
        {
          ok: false,
          uploaded: [],
          failed: [],
          error: t.photoDescriptionOrTagTooLong(
            TEXT_LIMITS.photoDescription,
            TEXT_LIMITS.tagName,
          ),
        },
        { status: 400 },
      );
    }

    if (normalizedFileNames.length === 0) {
      return json(
        {
          ok: false,
          uploaded: [],
          failed: [],
          error: t.noImageFilesReceived,
        },
        { status: 400 },
      );
    }

    if (normalizedFileNames.length > siteConfig.maxUploadFiles) {
      return json(
        {
          ok: false,
          uploaded: [],
          failed: [],
          error: t.batchUploadLimit(siteConfig.maxUploadFiles),
        },
        { status: 400 },
      );
    }

    const currentPhotoCount = await getPhotoCount(env);

    if (currentPhotoCount + normalizedFileNames.length > siteConfig.maxTotalPhotos) {
      return json(
        {
          ok: false,
          uploaded: [],
          failed: [],
          error: t.totalPhotoLimit(siteConfig.maxTotalPhotos),
        },
        { status: 400 },
      );
    }

    const uploaded = await createPhotos(
      env,
      new URL(request.url).origin,
      normalizedFileNames.map((fileName, index) => ({
        ...(photoDrafts[index] ?? {}),
        fileName,
        originalFile:
          siteConfig.uploadOriginalEnabled && storeOriginalFiles
            ? legacyFiles[index]
            : undefined,
        thumbnail: thumbnails[index],
        displayFile: displayFiles[index],
        watermarkedDisplayFile: watermarkedDisplayFiles[index],
        sourceHash: sourceHashes[index],
        exif: exifRecords[index],
        description: photoDrafts[index]?.description ?? description,
        tags: photoDrafts[index]?.tags ?? tags,
        showDateInfo,
        showCameraInfo,
        showLocationInfo,
        watermarkEnabled,
      })),
    );

    return json({
      ok: true,
      uploaded: uploaded.uploaded,
      failed: uploaded.failed,
    });
  }

  if (url.pathname === "/api/admin/photos" && request.method === "GET") {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    const tag = url.searchParams.get("tag");
    const page = parsePositiveNumber(url.searchParams.get("page"), 1);
    const pageSize = parsePositiveNumber(url.searchParams.get("pageSize"), 30);

    try {
      const result = await listPhotos(env, new URL(request.url).origin, tag, {
        includeHidden: true,
        page,
        pageSize,
        fallbackToBucket: false,
        hydrateBucketToDb: true,
      });
      const unfilteredResult = tag
        ? await listPhotos(env, new URL(request.url).origin, null, {
            includeHidden: true,
            page: 1,
            pageSize: 1,
            fallbackToBucket: false,
            hydrateBucketToDb: true,
          })
        : null;

      return json({
        items: result.items,
        page,
        pageSize,
        hasMore: result.hasMore,
        total: result.total,
        unfilteredTotal: unfilteredResult?.total ?? result.total,
      });
    } catch {
      const t = await getRequestMessages(env);
      return json(
        {
          ok: false,
          error: t.existingPhotosLoadFailed,
        },
        { status: 500 },
      );
    }
  }

  if (
    url.pathname.startsWith("/api/admin/photos/") &&
    request.method === "DELETE"
  ) {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    const id = url.pathname.split("/").filter(Boolean)[3];

    if (!id) {
      const t = await getRequestMessages(env);
      return json(
        {
          ok: false,
          error: t.missingPhotoId,
        },
        { status: 400 },
      );
    }

    const result = await deletePhotoById(env, id);
    const t = await getRequestMessages(env);

    return json(result, {
      status: result.ok
        ? 200
        : result.error === t.photoMissingOrDeleted
          ? 404
          : 400,
    });
  }

  if (
    url.pathname.startsWith("/api/admin/photos/") &&
    request.method === "PATCH"
  ) {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    const id = url.pathname.split("/").filter(Boolean)[3];

    if (!id) {
      const t = await getRequestMessages(env);
      return json(
        {
          ok: false,
          error: t.missingPhotoId,
        },
        { status: 400 },
      );
    }

    try {
      const t = await getRequestMessages(env);
      const body = (await request.json()) as {
        description?: string;
        tags?: string[];
        isHidden?: boolean;
      };

      if (body.description !== undefined) {
        if (typeof body.description !== "string") {
          return json({ ok: false, error: t.photoNoteInvalid }, { status: 400 });
        }

        if (
          !isWithinTextLimit(
            body.description.trim(),
            TEXT_LIMITS.photoDescription,
          )
        ) {
          return json(
            {
              ok: false,
              error: t.photoDescriptionTooLong(TEXT_LIMITS.photoDescription),
            },
            { status: 400 },
          );
        }
      }

      if (body.tags !== undefined) {
        if (!Array.isArray(body.tags)) {
          return json({ ok: false, error: t.tagsInvalid }, { status: 400 });
        }

        const normalizedTags = body.tags
          .map((tag) => String(tag).trim())
          .filter(Boolean);
        if (hasTagLengthOverflow(normalizedTags)) {
          return json(
            {
              ok: false,
              error: t.tagTooLong(TEXT_LIMITS.tagName),
            },
            { status: 400 },
          );
        }
      }

      const result = await updatePhotoById(env, id, body);

      return json(result, {
        status: result.ok ? 200 : 400,
      });
    } catch {
      const t = await getRequestMessages(env);
      return json(
        {
          ok: false,
          error: t.updatePhotoFailed,
        },
        { status: 500 },
      );
    }
  }

  if (url.pathname === "/api/admin/site" && request.method === "PATCH") {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    return handleSite(request, env);
  }

  if (url.pathname === "/api/admin/site/avatar" && request.method === "POST") {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    const t = await getRequestMessages(env);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return json(
        {
          ok: false,
          error: t.chooseAvatarFirst,
        },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return json(
        {
          ok: false,
          error: t.avatarMustBeImage,
        },
        { status: 400 },
      );
    }

    const currentConfig = await getSiteConfig(env);
    const previousFileName = extractAvatarFileName(
      currentConfig.photographerAvatarUrl,
    );
    const stored = await storePhotographerAvatar(env, file);

    if (!stored.persisted || !stored.fileName) {
      return json(
        {
          ok: false,
          error: t.avatarUploadStorageMissing,
        },
        { status: 400 },
      );
    }

    const avatarUrl = `/assets/avatar/${encodeURIComponent(stored.fileName)}`;
    const updateResult = await updateSiteConfig(env, {
      photographerAvatarUrl: avatarUrl,
    });

    if (!updateResult.ok) {
      await deleteAvatarObject(env, stored.fileName);
      return json(
        {
          ok: false,
          error: updateResult.error ?? t.avatarSaveFailed,
        },
        { status: 400 },
      );
    }

    if (previousFileName && previousFileName !== stored.fileName) {
      await deleteAvatarObject(env, previousFileName);
    }

    return json({
      ok: true,
      url: resolvePublicAssetUrl(request, avatarUrl),
    });
  }

  if (url.pathname === "/api/admin/tags" && request.method === "GET") {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    const tags = await getTagPool(env);
    return json({
      ok: true,
      tags,
    });
  }

  if (url.pathname === "/api/admin/tags" && request.method === "POST") {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    try {
      const t = await getRequestMessages(env);
      const body = (await request.json()) as { name: string };

      if (!body.name || body.name.trim().length === 0) {
        return json(
          {
            ok: false,
            error: t.tagNameRequired,
          },
          { status: 400 },
        );
      }

      if (!isWithinTextLimit(body.name.trim(), TEXT_LIMITS.tagName)) {
        return json(
          {
            ok: false,
            error: t.tagNameTooLong(TEXT_LIMITS.tagName),
          },
          { status: 400 },
        );
      }

      const existingTags = await getTagPool(env);
      const siteConfig = await getSiteConfig(env);

      if (existingTags.length >= siteConfig.maxTagPoolSize) {
        return json(
          {
            ok: false,
            error: t.tagPoolLimit(siteConfig.maxTagPoolSize),
          },
          { status: 400 },
        );
      }

      const tag = await createTagService(
        env,
        body.name.trim(),
        siteConfig.maxTagPoolSize,
      );
      return json({ ok: true, tag });
    } catch {
      const t = await getRequestMessages(env);
      return json(
        {
          ok: false,
          error: t.createTagFailed,
        },
        { status: 500 },
      );
    }
  }

  if (
    url.pathname.startsWith("/api/admin/tags/") &&
    request.method === "DELETE"
  ) {
    if (!isAuthenticated(request, env)) {
      return unauthorized((await getRequestMessages(env)).adminLoginRequired);
    }

    const id = url.pathname.split("/").filter(Boolean)[3];

    if (!id) {
      const t = await getRequestMessages(env);
      return json(
        {
          ok: false,
          error: t.missingTagId,
        },
        { status: 400 },
      );
    }

    const result = await deleteTagService(env, id);

    return json(result, {
      status: result.ok ? 200 : 400,
    });
  }

  return json(
    {
      ok: false,
      error: "Admin route scaffolded but not implemented",
    },
    { status: 501 },
  );
}
