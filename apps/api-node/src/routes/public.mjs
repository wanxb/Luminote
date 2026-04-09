import {
  getPublicPhotoDetail,
  getPublicPhotoList,
  getPublicSite,
  getPublicSiteTags,
} from "../services/public-content-service.mjs";
import { sendNotFound } from "../utils/http-response.mjs";

export async function handlePublicRoute({ req, res, url, repository, sendJson }) {
  if (url.pathname === "/api/site" && req.method === "GET") {
    sendJson(res, 200, await getPublicSite(repository));
    return true;
  }

  if (url.pathname === "/api/site/tags" && req.method === "GET") {
    sendJson(res, 200, await getPublicSiteTags(repository));
    return true;
  }

  if (url.pathname === "/api/photos" && req.method === "GET") {
    const tag = url.searchParams.get("tag");
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") || "30"));

    sendJson(
      res,
      200,
      await getPublicPhotoList(repository, {
        tag,
        page,
        pageSize,
      }),
    );
    return true;
  }

  if (url.pathname.startsWith("/api/photos/") && req.method === "GET") {
    const id = decodeURIComponent(url.pathname.slice("/api/photos/".length));
    const detail = await getPublicPhotoDetail(repository, id);

    if (!detail) {
      sendNotFound(res, "Photo not found");
      return true;
    }

    sendJson(res, 200, detail);
    return true;
  }

  return false;
}
