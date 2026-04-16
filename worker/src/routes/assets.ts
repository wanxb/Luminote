import type { Env } from "../index";
import { getAvatarObject, getPhotoObject } from "../services/storage-service";
import { handleMockStorage } from "./mock-storage";

type Variant = "thumb" | "display" | "display-watermarked" | "original";

type ParsedAsset =
  | {
      kind: "photo";
      variant: Variant;
      id: string;
    }
  | {
      kind: "avatar";
      fileName: string;
    };

function parsePath(pathname: string): ParsedAsset | null {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] !== "assets") {
    return null;
  }

  if (parts.length === 3 && parts[1] === "avatar" && parts[2]) {
    return {
      kind: "avatar",
      fileName: parts[2],
    };
  }

  if (parts.length !== 3) {
    return null;
  }

  const variant = parts[1];
  const id = parts[2];

  if (
    (variant !== "thumb" &&
      variant !== "display" &&
      variant !== "display-watermarked" &&
      variant !== "original") ||
    !id
  ) {
    return null;
  }

  return {
    kind: "photo",
    variant,
    id,
  };
}

export async function handleAssets(
  request: Request,
  env: Env,
): Promise<Response> {
  const parsed = parsePath(new URL(request.url).pathname);

  if (!parsed) {
    return new Response("Not Found", { status: 404 });
  }

  if (parsed.kind === "avatar") {
    const object = await getAvatarObject(env, parsed.fileName);

    if (!object?.body) {
      return handleMockStorage(
        new Request(
          `${new URL(request.url).origin}/mock-storage/avatar/${parsed.fileName}`,
        ),
      );
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=3600");

    return new Response(object.body, {
      headers,
    });
  }

  const object = await getPhotoObject(env, parsed.variant, parsed.id);

  if (!object?.body) {
    return new Response("Photo asset not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=3600");

  return new Response(object.body, {
    headers,
  });
}
