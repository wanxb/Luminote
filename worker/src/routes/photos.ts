import type { Env } from "../index";
import { getPhotoById, listPhotos } from "../services/photo-service";
import { json } from "../utils/json";

export async function handlePhotos(request: Request, env: Env): Promise<Response> {
  const origin = new URL(request.url).origin;
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 3) {
    const detail = await getPhotoById(env, origin, parts[2]);

    if (!detail) {
      return json(
        {
          ok: false,
          error: "Photo not found"
        },
        { status: 404 }
      );
    }

    return json(detail);
  }

  const items = await listPhotos(env, origin);

  return json({
    items,
    page: 1,
    pageSize: 30,
    hasMore: false
  });
}
