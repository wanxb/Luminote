const allowedOrigins = new Set(["http://localhost:3000"]);

export function applyCors(request: Request, response: Response) {
  const origin = request.headers.get("origin");

  if (!origin || !allowedOrigins.has(origin)) {
    return response;
  }

  response.headers.set("access-control-allow-origin", origin);
  response.headers.set("vary", "origin");
  response.headers.set("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
  response.headers.set("access-control-allow-headers", "content-type,authorization");

  return response;
}

export function createCorsPreflight(request: Request) {
  const response = new Response(null, { status: 204 });
  return applyCors(request, response);
}
