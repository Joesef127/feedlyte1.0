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

export function proxy(request: NextRequest) {
  if (!requiresSameOrigin(request)) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
