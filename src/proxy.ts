import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_MUTATION_PATHS = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/feedback",
  "/api/unsubscribe",
]);

function requiresSameOrigin(request: NextRequest): boolean {
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(request.method)) {
    return false;
  }

  const { pathname } = request.nextUrl;
  return !PUBLIC_MUTATION_PATHS.has(pathname) && !pathname.startsWith("/api/auth/");
}

function nextWithRequestId(request: NextRequest, requestId: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-request-id", requestId);
  return response;
}

export function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  if (!requiresSameOrigin(request)) {
    return nextWithRequestId(request, requestId);
  }

  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Invalid request origin.", code: "INVALID_REQUEST_ORIGIN" },
      { status: 403, headers: { "x-request-id": requestId } },
    );
  }

  return nextWithRequestId(request, requestId);
}

export const config = {
  matcher: "/api/:path*",
};
