import type { Env } from "../index";
import { getPhotoById, listPhotos } from "../services/photo-service";
import { json } from "../utils/json";
import {
  getPublicPhotoDetail,
  getPublicPhotoList,
} from "../../../packages/core/src";

function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export async function handlePhotos(
  request: Request,
  env: Env,
): Promise<Response> {
  const origin = new URL(request.url).origin;
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  const url = new URL(request.url);

  if (parts.length === 3) {
    const detail = await getPublicPhotoDetail(
      {
        getPhotoDetail(id) {
          return getPhotoById(env, origin, id);
        },
        listPhotos() {
          throw new Error("listPhotos is not used in detail requests");
        },
      },
      parts[2],
    );

    if (!detail) {
      return json(
        {
          ok: false,
          error: "Photo not found",
        },
        { status: 404 },
      );
    }

    return json(detail);
  }

  const page = parsePositiveNumber(url.searchParams.get("page"), 1);
  const pageSize = parsePositiveNumber(url.searchParams.get("pageSize"), 30);
  const tag = url.searchParams.get("tag");

  try {
    const result = await getPublicPhotoList(
      {
        async listPhotos(input) {
          return listPhotos(env, origin, input.tag ?? null, {
            page: input.page,
            pageSize: input.pageSize,
          });
        },
        getPhotoDetail(id) {
          return getPhotoById(env, origin, id);
        },
      },
      {
        tag,
        page,
        pageSize,
      },
    );

    return json(result);
  } catch (error) {
    console.error("[handlePhotos] listPhotos failed", error);
    return json(
      {
        ok: false,
        error: "加载照片列表失败。",
      },
      { status: 500 },
    );
  }
}
