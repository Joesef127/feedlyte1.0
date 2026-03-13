import { auth } from "@/auth";
import { NextResponse } from "next/server";

// ── JSON response helpers ─────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

// ── Auth guard ────────────────────────────────────────────────────────────────

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

// ── Structured error handler ──────────────────────────────────────────────────

/**
 * Maps known error types to user-facing messages + HTTP status codes.
 * Covers: ApiError, Prisma errors (P2002/P2003/P2025/P2016), JSON parse,
 * network/connection errors, and unexpected throws.
 */
export function handleError(
  e: unknown,
  context: string,
  extraHeaders?: HeadersInit
): NextResponse {
  // Already a structured API error — pass through
  if (e instanceof ApiError) {
    return err(e.message, e.status, extraHeaders);
  }

  // Prisma known error codes
  if (isPrismaKnownError(e)) {
    const code = e.code;
    if (code === "P2002") {
      const field = Array.isArray(e.meta?.target)
        ? (e.meta.target as string[]).join(", ")
        : "field";
      console.error(`[${context}] Unique constraint violation on ${field}`, e);
      return err(`A record with this ${field} already exists.`, 409, extraHeaders);
    }
    if (code === "P2025") {
      console.error(`[${context}] Record not found`, e);
      return err("The requested record was not found.", 404, extraHeaders);
    }
    if (code === "P2003") {
      const field = (e.meta?.field_name as string) ?? "related record";
      console.error(`[${context}] Foreign key constraint failed on ${field}`, e);
      return err(`Related record not found: ${field}.`, 400, extraHeaders);
    }
    if (code === "P2016") {
      console.error(`[${context}] Query interpretation error`, e);
      return err("Invalid query — check your request data.", 400, extraHeaders);
    }
    // All other Prisma errors (connection, auth, etc.)
    console.error(`[${context}] Prisma error ${code}`, e);
    return err(`Database error (${code}). Please try again.`, 500, extraHeaders);
  }

  // Prisma init / connection errors (not PrismaKnownRequestError)
  if (isPrismaClientError(e)) {
    console.error(`[${context}] Prisma client error`, e);
    return err("Could not connect to the database. Please try again.", 503, extraHeaders);
  }

  // JSON parse error from req.json()
  if (e instanceof SyntaxError) {
    return err("Invalid JSON in request body.", 400, extraHeaders);
  }

  // Unexpected
  console.error(`[${context}] Unhandled error`, e);
  return err("Internal server error.", 500, extraHeaders);
}

function isPrismaKnownError(
  e: unknown
): e is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    typeof (e as Record<string, unknown>).code === "string" &&
    !!(e as Record<string, unknown>).code?.toString().startsWith("P")
  );
}

function isPrismaClientError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "__typename" in (e as Record<string, unknown>)
  );
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
      return handleError(e, "handler");
    }
  };
}

// ── IP extraction ─────────────────────────────────────────────────────────────

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
