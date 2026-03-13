import { auth } from "@/auth";
import { NextResponse } from "next/server";

// ── JSON response helpers ─────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// ── Auth guard ────────────────────────────────────────────────────────────────

/**
 * Returns the authenticated session or throws a 401 response.
 * Usage: const session = await requireAuth(); — throws inside API routes if not authed.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }
  return session;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number
  ) {
    super(message);
  }
}

/**
 * Wraps a route handler to catch ApiErrors and other errors.
 */
export function withErrorHandling(
  handler: (...args: unknown[]) => Promise<Response>
) {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof ApiError) {
        return err(e.message, e.status);
      }
      console.error("[API Error]", e);
      return err("Internal server error", 500);
    }
  };
}

// ── IP extraction ─────────────────────────────────────────────────────────────

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
