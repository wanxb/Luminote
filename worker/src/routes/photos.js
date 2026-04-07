import { getPhotoById, listPhotos } from "../services/photo-service";
import { json } from "../utils/json";
export async function handlePhotos(request, env) {
    const origin = new URL(request.url).origin;
    const pathname = new URL(request.url).pathname;
    const parts = pathname.split("/").filter(Boolean);
    const url = new URL(request.url);
    if (parts.length === 3) {
        const detail = await getPhotoById(env, origin, parts[2]);
        if (!detail) {
            return json({
                ok: false,
                error: "Photo not found",
            }, { status: 404 });
        }
        return json(detail);
    }
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "30");
    const tag = url.searchParams.get("tag");
    try {
        const items = await listPhotos(env, origin, tag);
        return json({
            items,
            page,
            pageSize,
            hasMore: items.length >= pageSize,
        });
    }
    catch {
        return json({
            ok: false,
            error: "加载照片列表失败。",
        }, { status: 500 });
    }
}
