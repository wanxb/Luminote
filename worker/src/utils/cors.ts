function isAllowedOrigin(origin: string) {
  try {
    const url = new URL(origin);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export function applyCors(request: Request, response: Response) {
  const origin = request.headers.get("origin");

  if (!origin || !isAllowedOrigin(origin)) {
    return response;
  }

  response.headers.set("access-control-allow-origin", origin);
  response.headers.set("vary", "origin");
  response.headers.set(
    "access-control-allow-methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  response.headers.set("access-control-allow-headers", "content-type");
  response.headers.set("access-control-allow-credentials", "true");

  return response;
}

export function createCorsPreflight(request: Request) {
  const response = new Response(null, { status: 204 });
  return applyCors(request, response);
}
