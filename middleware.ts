import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function normalizeOrigin(origin: string) {
  try {
    return new URL(origin).origin;
  } catch {
    return "";
  }
}

function isLoopbackOrigin(origin: string) {
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

function getAllowedOrigins() {
  return new Set(
    (process.env.FRONTEND_CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => normalizeOrigin(value.trim()))
      .filter(Boolean),
  );
}

function resolveAllowedOrigin(origin: string) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return "";
  }

  if (isLoopbackOrigin(normalizedOrigin)) {
    return normalizedOrigin;
  }

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.has(normalizedOrigin) ? normalizedOrigin : "";
}

function applyCorsHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return response;
  }

  const allowedOrigin = resolveAllowedOrigin(origin);

  if (!allowedOrigin) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Vary", "Origin");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ?? "content-type",
  );

  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
  }

  return applyCorsHeaders(request, NextResponse.next());
}

export const config = {
  matcher: "/:path*",
};
