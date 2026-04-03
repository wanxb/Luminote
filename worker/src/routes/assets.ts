import type { Env } from "../index";
import { getPhotoObject } from "../services/storage-service";
import { handleMockStorage } from "./mock-storage";

type Variant = "thumb" | "display" | "display-watermarked";

function parsePath(pathname: string): { variant: Variant; id: string } | null {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length !== 3 || parts[0] !== "assets") {
    return null;
  }

  const variant = parts[1];
  const id = parts[2];

  if ((variant !== "thumb" && variant !== "display" && variant !== "display-watermarked") || !id) {
    return null;
  }

  return {
    variant,
    id
  };
}

export async function handleAssets(request: Request, env: Env): Promise<Response> {
  const parsed = parsePath(new URL(request.url).pathname);

  if (!parsed) {
    return new Response("Not Found", { status: 404 });
  }

  const object = await getPhotoObject(env, parsed.variant, parsed.id);

  if (!object?.body) {
    const fallbackVariant =
      parsed.variant === "thumb"
        ? "thumb"
        : parsed.variant === "display-watermarked"
          ? "watermarked"
          : "display";
    return handleMockStorage(new Request(`${new URL(request.url).origin}/mock-storage/${fallbackVariant}/${parsed.id}`));
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=3600");

  return new Response(object.body, {
    headers
  });
}
