import { createPhotos, deletePhotoById, listPhotos, updatePhotoById, } from "../services/photo-service";
import { getSiteConfig, updateSiteConfig, verifyAdminPassword, } from "../services/site-config-service";
import { deleteAvatarObject, storePhotographerAvatar, } from "../services/storage-service";
import { getTagPool, createTag as createTagService, deleteTag as deleteTagService, } from "../services/tag-service";
import { TEXT_LIMITS, isWithinTextLimit } from "../utils/text-limits";
import { json } from "../utils/json";
import { handleSite } from "./site";
const sessionCookieName = "luminote_admin_session";
const sessionIdleTimeoutSeconds = 60 * 60 * 2;
function unauthorized(message = "Unauthorized") {
    return json({
        ok: false,
        error: message,
    }, { status: 401 });
}
function getSessionToken(request) {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
        return "";
    }
    const cookies = cookieHeader.split(";").map((item) => item.trim());
    const target = cookies.find((item) => item.startsWith(`${sessionCookieName}=`));
    if (!target) {
        return "";
    }
    return decodeURIComponent(target.slice(`${sessionCookieName}=`.length));
}
function createSessionCookie(request, env) {
    const url = new URL(request.url);
    const isHttps = url.protocol === "https:";
    return [
        `${sessionCookieName}=${encodeURIComponent(env.ADMIN_SESSION_TOKEN)}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        isHttps ? "Secure" : "",
        `Max-Age=${sessionIdleTimeoutSeconds}`,
    ]
        .filter(Boolean)
        .join("; ");
}
function clearSessionCookie(request) {
    const url = new URL(request.url);
    const isHttps = url.protocol === "https:";
    return [
        `${sessionCookieName}=`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        isHttps ? "Secure" : "",
        "Max-Age=0",
    ]
        .filter(Boolean)
        .join("; ");
}
function isAuthenticated(request, env) {
    const token = getSessionToken(request);
    return Boolean(token && token === env.ADMIN_SESSION_TOKEN);
}
function parseTagsInput(rawValue, maxTagsPerPhoto) {
    if (typeof rawValue !== "string") {
        return [];
    }
    try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
            return Array.from(new Set(parsed.map((tag) => String(tag).trim()).filter(Boolean))).slice(0, maxTagsPerPhoto);
        }
    }
    catch {
        // Fallback to comma-separated tags for older clients.
    }
    return rawValue
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag, index, list) => list.indexOf(tag) === index)
        .slice(0, maxTagsPerPhoto);
}
function parseFileNames(rawValue) {
    if (typeof rawValue !== "string") {
        return [];
    }
    try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item));
        }
    }
    catch {
        return [];
    }
    return [];
}
function parsePhotoDrafts(rawValue, maxTagsPerPhoto) {
    if (typeof rawValue !== "string") {
        return [];
    }
    try {
        const parsed = JSON.parse(rawValue);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.map((item) => {
            if (!item || typeof item !== "object") {
                return { tags: [] };
            }
            const draft = item;
            return {
                description: typeof draft.description === "string" ? draft.description : undefined,
                tags: Array.isArray(draft.tags)
                    ? Array.from(new Set(draft.tags.map((tag) => String(tag).trim()).filter(Boolean))).slice(0, maxTagsPerPhoto)
                    : [],
            };
        });
    }
    catch {
        return [];
    }
}
function hasTagLengthOverflow(tags) {
    return tags.some((tag) => tag.length > TEXT_LIMITS.tagName);
}
function extractAvatarFileName(avatarUrl) {
    try {
        const pathname = avatarUrl.startsWith("http")
            ? new URL(avatarUrl).pathname
            : avatarUrl;
        if (!pathname.startsWith("/assets/avatar/")) {
            return "";
        }
        return decodeURIComponent(pathname.slice("/assets/avatar/".length));
    }
    catch {
        return "";
    }
}
function resolvePublicAssetUrl(request, assetUrl) {
    const trimmed = assetUrl.trim();
    if (!trimmed) {
        return "";
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return new URL(trimmed, request.url).toString();
}
export async function handleAdmin(request, env) {
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
        const body = (await request.json());
        if (!body.password || !(await verifyAdminPassword(env, body.password))) {
            return unauthorized("管理员密码错误。");
        }
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
        response.headers.append("set-cookie", clearSessionCookie(request));
        return response;
    }
    if (url.pathname === "/api/admin/photos" && request.method === "POST") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        const siteConfig = await getSiteConfig(env);
        const formData = await request.formData();
        const legacyFiles = formData
            .getAll("files[]")
            .filter((entry) => entry instanceof File);
        const fileNames = parseFileNames(formData.get("fileNames"));
        const thumbnails = formData
            .getAll("thumbnails[]")
            .filter((entry) => entry instanceof File);
        const displayFiles = formData
            .getAll("displayFiles[]")
            .filter((entry) => entry instanceof File);
        const watermarkedDisplayFiles = formData
            .getAll("watermarkedDisplayFiles[]")
            .map((entry) => entry instanceof File && entry.size > 0 ? entry : undefined);
        const exifRecords = formData.getAll("exif[]").map((entry) => {
            if (typeof entry !== "string") {
                return {};
            }
            try {
                return JSON.parse(entry);
            }
            catch {
                return {};
            }
        });
        const watermarkEnabled = formData.get("watermarkEnabled") === "true";
        const storeOriginalFiles = formData.get("storeOriginalFiles") === "true";
        const description = String(formData.get("description") ?? "");
        const showDateInfo = formData.get("showDateInfo") === "true";
        const showCameraInfo = formData.get("showCameraInfo") === "true";
        const showLocationInfo = formData.get("showLocationInfo") === "true";
        const tags = parseTagsInput(formData.get("tags"), siteConfig.maxTagsPerPhoto);
        const photoDrafts = parsePhotoDrafts(formData.get("photoDrafts"), siteConfig.maxTagsPerPhoto);
        const normalizedFileNames = fileNames.length > 0 ? fileNames : legacyFiles.map((file) => file.name);
        if (!isWithinTextLimit(description.trim(), TEXT_LIMITS.photoDescription)) {
            return json({
                ok: false,
                uploaded: [],
                failed: [],
                error: `照片备注不能超过 ${TEXT_LIMITS.photoDescription} 个字符。`,
            }, { status: 400 });
        }
        if (hasTagLengthOverflow(tags)) {
            return json({
                ok: false,
                uploaded: [],
                failed: [],
                error: `单个标签不能超过 ${TEXT_LIMITS.tagName} 个字符。`,
            }, { status: 400 });
        }
        if (photoDrafts.some((draft) => (draft.description &&
            !isWithinTextLimit(draft.description.trim(), TEXT_LIMITS.photoDescription)) ||
            hasTagLengthOverflow(draft.tags))) {
            return json({
                ok: false,
                uploaded: [],
                failed: [],
                error: `照片备注不能超过 ${TEXT_LIMITS.photoDescription} 个字符，单个标签不能超过 ${TEXT_LIMITS.tagName} 个字符。`,
            }, { status: 400 });
        }
        if (normalizedFileNames.length === 0) {
            return json({
                ok: false,
                uploaded: [],
                failed: [],
                error: "未接收到任何图片文件。",
            }, { status: 400 });
        }
        if (normalizedFileNames.length > siteConfig.maxUploadFiles) {
            return json({
                ok: false,
                uploaded: [],
                failed: [],
                error: `单次最多上传 ${siteConfig.maxUploadFiles} 张照片。`,
            }, { status: 400 });
        }
        try {
            const uploaded = await createPhotos(env, new URL(request.url).origin, normalizedFileNames.map((fileName, index) => ({
                ...(photoDrafts[index] ?? {}),
                fileName,
                originalFile: siteConfig.uploadOriginalEnabled && storeOriginalFiles
                    ? legacyFiles[index]
                    : undefined,
                thumbnail: thumbnails[index],
                displayFile: displayFiles[index],
                watermarkedDisplayFile: watermarkedDisplayFiles[index],
                exif: exifRecords[index],
                description: photoDrafts[index]?.description ?? description,
                tags: photoDrafts[index]?.tags ?? tags,
                showDateInfo,
                showCameraInfo,
                showLocationInfo,
                watermarkEnabled,
            })));
            return json({
                ok: uploaded.length > 0,
                uploaded,
                failed: [],
                error: uploaded.length === 0 ? "上传失败，请稍后再试。" : undefined,
            }, { status: uploaded.length > 0 ? 200 : 500 });
        }
        catch (error) {
            return json({
                ok: false,
                uploaded: [],
                failed: [],
                error: error instanceof Error ? error.message : "上传失败，请稍后再试。",
            }, { status: 500 });
        }
    }
    if (url.pathname === "/api/admin/photos" && request.method === "GET") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        const tag = url.searchParams.get("tag");
        try {
            const items = await listPhotos(env, new URL(request.url).origin, tag, {
                includeHidden: true,
            });
            return json({
                items,
                page: 1,
                pageSize: 30,
                hasMore: items.length >= 30,
            });
        }
        catch {
            return json({
                ok: false,
                error: "加载现有照片失败。",
            }, { status: 500 });
        }
    }
    if (url.pathname.startsWith("/api/admin/photos/") &&
        request.method === "DELETE") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        const id = url.pathname.split("/").filter(Boolean)[3];
        if (!id) {
            return json({
                ok: false,
                error: "缺少照片 ID。",
            }, { status: 400 });
        }
        const result = await deletePhotoById(env, id);
        return json(result, {
            status: result.ok
                ? 200
                : result.error === "照片不存在或已被删除。"
                    ? 404
                    : 400,
        });
    }
    if (url.pathname.startsWith("/api/admin/photos/") &&
        request.method === "PATCH") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        const id = url.pathname.split("/").filter(Boolean)[3];
        if (!id) {
            return json({
                ok: false,
                error: "缺少照片 ID。",
            }, { status: 400 });
        }
        try {
            const body = (await request.json());
            if (body.description !== undefined) {
                if (typeof body.description !== "string") {
                    return json({ ok: false, error: "照片备注格式错误。" }, { status: 400 });
                }
                if (!isWithinTextLimit(body.description.trim(), TEXT_LIMITS.photoDescription)) {
                    return json({
                        ok: false,
                        error: `照片备注不能超过 ${TEXT_LIMITS.photoDescription} 个字符。`,
                    }, { status: 400 });
                }
            }
            if (body.tags !== undefined) {
                if (!Array.isArray(body.tags)) {
                    return json({ ok: false, error: "标签格式错误。" }, { status: 400 });
                }
                const normalizedTags = body.tags
                    .map((tag) => String(tag).trim())
                    .filter(Boolean);
                if (hasTagLengthOverflow(normalizedTags)) {
                    return json({
                        ok: false,
                        error: `单个标签不能超过 ${TEXT_LIMITS.tagName} 个字符。`,
                    }, { status: 400 });
                }
            }
            const result = await updatePhotoById(env, id, body);
            return json(result, {
                status: result.ok ? 200 : 400,
            });
        }
        catch {
            return json({
                ok: false,
                error: "更新照片失败。",
            }, { status: 500 });
        }
    }
    if (url.pathname === "/api/admin/site" && request.method === "PATCH") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        return handleSite(request, env);
    }
    if (url.pathname === "/api/admin/site/avatar" && request.method === "POST") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        const formData = await request.formData();
        const file = formData.get("file");
        if (!(file instanceof File) || file.size === 0) {
            return json({
                ok: false,
                error: "请先选择头像图片。",
            }, { status: 400 });
        }
        if (!file.type.startsWith("image/")) {
            return json({
                ok: false,
                error: "头像必须是图片文件。",
            }, { status: 400 });
        }
        const currentConfig = await getSiteConfig(env);
        const previousFileName = extractAvatarFileName(currentConfig.photographerAvatarUrl);
        const stored = await storePhotographerAvatar(env, file);
        if (!stored.persisted || !stored.fileName) {
            return json({
                ok: false,
                error: "头像上传失败，当前环境未绑定对象存储。",
            }, { status: 400 });
        }
        const avatarUrl = `/assets/avatar/${encodeURIComponent(stored.fileName)}`;
        const updateResult = await updateSiteConfig(env, {
            photographerAvatarUrl: avatarUrl,
        });
        if (!updateResult.ok) {
            await deleteAvatarObject(env, stored.fileName);
            return json({
                ok: false,
                error: updateResult.error ?? "头像保存失败。",
            }, { status: 400 });
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
            return unauthorized("请先完成管理员登录。");
        }
        const tags = await getTagPool(env);
        return json({
            ok: true,
            tags,
        });
    }
    if (url.pathname === "/api/admin/tags" && request.method === "POST") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        try {
            const body = (await request.json());
            if (!body.name || body.name.trim().length === 0) {
                return json({
                    ok: false,
                    error: "标签名称不能为空。",
                }, { status: 400 });
            }
            if (!isWithinTextLimit(body.name.trim(), TEXT_LIMITS.tagName)) {
                return json({
                    ok: false,
                    error: `标签名称不能超过 ${TEXT_LIMITS.tagName} 个字符。`,
                }, { status: 400 });
            }
            const existingTags = await getTagPool(env);
            const siteConfig = await getSiteConfig(env);
            if (existingTags.length >= siteConfig.maxTagPoolSize) {
                return json({
                    ok: false,
                    error: `标签总数最多 ${siteConfig.maxTagPoolSize} 个。`,
                }, { status: 400 });
            }
            const tag = await createTagService(env, body.name.trim(), siteConfig.maxTagPoolSize);
            return json({ ok: true, tag });
        }
        catch {
            return json({
                ok: false,
                error: "创建标签失败。",
            }, { status: 500 });
        }
    }
    if (url.pathname.startsWith("/api/admin/tags/") &&
        request.method === "DELETE") {
        if (!isAuthenticated(request, env)) {
            return unauthorized("请先完成管理员登录。");
        }
        const id = url.pathname.split("/").filter(Boolean)[3];
        if (!id) {
            return json({
                ok: false,
                error: "缺少标签 ID。",
            }, { status: 400 });
        }
        const result = await deleteTagService(env, id);
        return json(result, {
            status: result.ok ? 200 : 400,
        });
    }
    return json({
        ok: false,
        error: "Admin route scaffolded but not implemented",
    }, { status: 501 });
}
