import { NextResponse } from "next/server";
import { auth } from "@/auth";

// ── JSON response helpers ─────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export const API_ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export const API_VERSION = "v1";
export const WIDGET_CONFIG_VERSION = "v1";

export function withApiVersionHeaders(
  headers: HeadersInit = {},
  version = API_VERSION,
): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("X-Feedlyte-API-Version", version);
  return nextHeaders;
}

export function withWidgetVersionHeaders(
  headers: HeadersInit = {},
  version = WIDGET_CONFIG_VERSION,
): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("X-Feedlyte-Widget-Version", version);
  return nextHeaders;
}

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export function err(
  message: string,
  status: number,
  headers?: HeadersInit,
  code: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR,
) {
  return NextResponse.json({ error: message, code }, { status, headers });
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
    public status: number,
    public code: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR,
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
    logApiError(context, e.code, e.status, e.message);
    return err(e.message, e.status, extraHeaders, e.code);
  }

  // Prisma known request errors
  if (isPrismaKnownError(e)) {
    const code = e.code;

    if (code === "P2002") {
      const fields = Array.isArray(e.meta?.target)
        ? (e.meta.target as string[]).join(", ")
        : "field";
      logApiError(context, API_ERROR_CODES.CONFLICT, 409, "Unique constraint");
      const friendly = friendlyUniqueField(fields);
      return err(friendly, 409, extraHeaders, API_ERROR_CODES.CONFLICT);
    }

    if (code === "P2025") {
      logApiError(context, API_ERROR_CODES.NOT_FOUND, 404, "Record not found");
      return err("The requested record was not found.", 404, extraHeaders, API_ERROR_CODES.NOT_FOUND);
    }

    if (code === "P2003") {
      const field = (e.meta?.field_name as string) ?? "related record";
      logApiError(context, API_ERROR_CODES.BAD_REQUEST, 400, "Foreign key constraint");
      return err(`Related record not found: ${field}.`, 400, extraHeaders, API_ERROR_CODES.BAD_REQUEST);
    }

    if (code === "P2016") {
      logApiError(context, API_ERROR_CODES.BAD_REQUEST, 400, "Query interpretation error");
      return err("Invalid query parameters.", 400, extraHeaders, API_ERROR_CODES.BAD_REQUEST);
    }

    if (code === "P2021") {
      logApiError(context, API_ERROR_CODES.SERVICE_UNAVAILABLE, 503, "Database schema is out of date");
      return err("Database schema is out of date. Please contact support.", 503, extraHeaders, API_ERROR_CODES.SERVICE_UNAVAILABLE);
    }

    if (code === "P2024") {
      logApiError(context, API_ERROR_CODES.SERVICE_UNAVAILABLE, 503, "Connection pool timeout");
      return err("Database is busy. Please try again in a moment.", 503, extraHeaders, API_ERROR_CODES.SERVICE_UNAVAILABLE);
    }

    // All other Prisma errors
    logApiError(context, API_ERROR_CODES.INTERNAL_ERROR, 500, `Prisma ${code}`);
    return err("Database error. Please try again.", 500, extraHeaders);
  }

  // Prisma client initialization errors (missing env, connection refused)
  if (isPrismaClientError(e)) {
    logApiError(context, API_ERROR_CODES.SERVICE_UNAVAILABLE, 503, "Prisma client error");
    return err("Could not connect to the database. Please try again.", 503, extraHeaders, API_ERROR_CODES.SERVICE_UNAVAILABLE);
  }

  // JSON parse errors from req.json()
  if (e instanceof SyntaxError) {
    return err("Invalid JSON in request body.", 400, extraHeaders, API_ERROR_CODES.BAD_REQUEST);
  }

  // TypeError — usually a programming error or missing env var
  if (e instanceof TypeError) {
    logApiError(context, API_ERROR_CODES.INTERNAL_ERROR, 500, e.message);
    return err("An internal error occurred. Please try again.", 500, extraHeaders);
  }

  // Unexpected
  logApiError(context, API_ERROR_CODES.INTERNAL_ERROR, 500, "Unhandled error");
  return err("An unexpected error occurred. Please try again.", 500, extraHeaders);
}

function logApiError(
  context: string,
  code: ApiErrorCode,
  status: number,
  message: string,
) {
  console.error(JSON.stringify({ level: "error", context, code, status, message }));
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