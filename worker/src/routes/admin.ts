import type { Env } from "../index";
import { createPhotos, deletePhotoById } from "../services/photo-service";
import { json } from "../utils/json";

const sessionCookieName = "luminote_admin_session";

function unauthorized(message = "Unauthorized") {
  return json(
    {
      ok: false,
      error: message
    },
    { status: 401 }
  );
}

function getSessionToken(request: Request) {
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

function createSessionCookie(request: Request, env: Env) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";

  return [
    `${sessionCookieName}=${encodeURIComponent(env.ADMIN_SESSION_TOKEN)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : "",
    `Max-Age=${60 * 60 * 24 * 7}`
  ]
    .filter(Boolean)
    .join("; ");
}

function clearSessionCookie(request: Request) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";

  return [
    `${sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : "",
    "Max-Age=0"
  ]
    .filter(Boolean)
    .join("; ");
}

function isAuthenticated(request: Request, env: Env) {
  const token = getSessionToken(request);
  return Boolean(token && token === env.ADMIN_SESSION_TOKEN);
}

export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/admin/session" && request.method === "GET") {
    return json({
      ok: true,
      authenticated: isAuthenticated(request, env)
    });
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const body = (await request.json()) as { password?: string };

    if (!body.password || body.password !== env.ADMIN_PASSWORD) {
      return unauthorized("管理员密码错误。");
    }

    const response = json({
      ok: true,
      authenticated: true
    });
    response.headers.append("set-cookie", createSessionCookie(request, env));
    return response;
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    const response = json({
      ok: true
    });
    response.headers.append("set-cookie", clearSessionCookie(request));
    return response;
  }

  if (url.pathname === "/api/admin/photos" && request.method === "POST") {
    if (!isAuthenticated(request, env)) {
      return unauthorized("请先完成管理员登录。");
    }

    const formData = await request.formData();
    const files = formData.getAll("files[]").filter((entry): entry is File => entry instanceof File);
    const thumbnails = formData
      .getAll("thumbnails[]")
      .filter((entry): entry is File => entry instanceof File);
    const displayFiles = formData
      .getAll("displayFiles[]")
      .filter((entry): entry is File => entry instanceof File);
    const watermarkedDisplayFiles = formData
      .getAll("watermarkedDisplayFiles[]")
      .map((entry) => (entry instanceof File && entry.size > 0 ? entry : undefined));
    const exifRecords = formData
      .getAll("exif[]")
      .map((entry) => {
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
    const description = String(formData.get("description") ?? "");
    const showDateInfo = formData.get("showDateInfo") === "true";
    const showCameraInfo = formData.get("showCameraInfo") === "true";
    const showLocationInfo = formData.get("showLocationInfo") === "true";
    const rawTags = String(formData.get("tags") ?? "");
    const tags = rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (files.length === 0) {
      return json(
        {
          ok: false,
          uploaded: [],
          failed: [],
          error: "未接收到任何图片文件。"
        },
        { status: 400 }
      );
    }

    const uploaded = await createPhotos(
      env,
      new URL(request.url).origin,
      files.map((file, index) => ({
        fileName: file.name,
        file,
        thumbnail: thumbnails[index],
        displayFile: displayFiles[index],
        watermarkedDisplayFile: watermarkedDisplayFiles[index],
        exif: exifRecords[index],
        description,
        tags,
        showDateInfo,
        showCameraInfo,
        showLocationInfo,
        watermarkEnabled
      }))
    );

    return json({
      ok: true,
      uploaded,
      failed: []
    });
  }

  if (url.pathname.startsWith("/api/admin/photos/") && request.method === "DELETE") {
    if (!isAuthenticated(request, env)) {
      return unauthorized("请先完成管理员登录。");
    }

    const id = url.pathname.split("/").filter(Boolean)[3];

    if (!id) {
      return json(
        {
          ok: false,
          error: "缺少照片 ID。"
        },
        { status: 400 }
      );
    }

    const result = await deletePhotoById(env, id);

    return json(result, {
      status: result.ok ? 200 : result.error === "照片不存在或已被删除。" ? 404 : 400
    });
  }

  return json(
    {
      ok: false,
      error: "Admin route scaffolded but not implemented"
    },
    { status: 501 }
  );
}
