import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

export function handleError(
  e: unknown,
  context: string,
  extraHeaders?: HeadersInit
): NextResponse {
  // Already a structured API error — pass through as-is
  if (e instanceof ApiError) {
    console.error(`[${context}] ApiError ${e.status}:`, e.message);
    return err(e.message, e.status, extraHeaders);
  }

  // Prisma known request errors
  if (isPrismaKnownError(e)) {
    const code = e.code;

    if (code === "P2002") {
      const fields = Array.isArray(e.meta?.target)
        ? (e.meta.target as string[]).join(", ")
        : "field";
      console.error(`[${context}] Unique constraint on ${fields}`);
      const friendly = friendlyUniqueField(fields);
      return err(friendly, 409, extraHeaders);
    }

    if (code === "P2025") {
      console.error(`[${context}] Record not found`);
      return err("The requested record was not found.", 404, extraHeaders);
    }

    if (code === "P2003") {
      const field = (e.meta?.field_name as string) ?? "related record";
      console.error(`[${context}] Foreign key constraint on ${field}`);
      return err(`Related record not found: ${field}.`, 400, extraHeaders);
    }

    if (code === "P2016") {
      console.error(`[${context}] Query interpretation error`);
      return err("Invalid query parameters.", 400, extraHeaders);
    }

    if (code === "P2021") {
      console.error(`[${context}] Table not found — run prisma migrate`);
      return err("Database schema is out of date. Please contact support.", 503, extraHeaders);
    }

    if (code === "P2024") {
      console.error(`[${context}] Connection pool timeout`);
      return err("Database is busy. Please try again in a moment.", 503, extraHeaders);
    }

    // All other Prisma errors
    console.error(`[${context}] Prisma ${code}:`, e);
    return err(`Database error. Please try again.`, 500, extraHeaders);
  }

  // Prisma client initialization errors (missing env, connection refused)
  if (isPrismaClientError(e)) {
    console.error(`[${context}] Prisma client error:`, e);
    return err("Could not connect to the database. Please try again.", 503, extraHeaders);
  }

  // JSON parse errors from req.json()
  if (e instanceof SyntaxError) {
    return err("Invalid JSON in request body.", 400, extraHeaders);
  }

  // TypeError — usually a programming error or missing env var
  if (e instanceof TypeError) {
    console.error(`[${context}] TypeError:`, e.message);
    return err("An internal error occurred. Please try again.", 500, extraHeaders);
  }

  // Unexpected
  console.error(`[${context}] Unhandled error:`, e);
  return err("An unexpected error occurred. Please try again.", 500, extraHeaders);
}

// Map known Prisma unique fields to human-readable messages
function friendlyUniqueField(fields: string): string {
  if (fields.includes("email")) {
    return "An account with this email already exists.";
  }
  if (fields.includes("name")) {
    return "This name is already taken.";
  }
  return `A record with this ${fields} already exists.`;
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
    ("__typename" in (e as Record<string, unknown>) ||
      (e instanceof Error &&
        (e.message.includes("Can't reach database") ||
          e.message.includes("Connection refused") ||
          e.message.includes("ECONNREFUSED"))))
  );
}

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
  return req.headers.get("x-real-ip") ?? "unknown";
}