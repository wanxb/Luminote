import type { Env } from "../index";
import { createPhotos } from "../services/photo-service";
import { json } from "../utils/json";

function unauthorized(message = "Unauthorized") {
  return json(
    {
      ok: false,
      error: message
    },
    { status: 401 }
  );
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length);
}

export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const body = (await request.json()) as { password?: string };

    if (!body.password || body.password !== env.ADMIN_PASSWORD) {
      return unauthorized("管理员密码错误。");
    }

    return json({
      ok: true,
      token: env.ADMIN_SESSION_TOKEN
    });
  }

  if (url.pathname === "/api/admin/photos" && request.method === "POST") {
    const token = getBearerToken(request);

    if (!token || token !== env.ADMIN_SESSION_TOKEN) {
      return unauthorized("请先完成管理员登录。");
    }

    const formData = await request.formData();
    const files = formData.getAll("files[]").filter((entry): entry is File => entry instanceof File);
    const thumbnails = formData
      .getAll("thumbnails[]")
      .filter((entry): entry is File => entry instanceof File);
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

  return json(
    {
      ok: false,
      error: "Admin route scaffolded but not implemented"
    },
    { status: 501 }
  );
}
