import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { submitFeedbackSchema, projectQuerySchema } from "@/lib/validations";
import { checkWidgetRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { handleError } from "@/lib/api-helpers";

// ── CORS ──────────────────────────────────────────────────────────────────────

// Fallback origins used when a project has no allowedOrigin set.
// Covers existing projects created before Module 1.5.
const FALLBACK_ORIGINS = [
  "https://feedlyte.vercel.app",
  "http://localhost:3000",
];

function isOriginAllowed(
  origin: string,
  projectOrigin: string | null,
): boolean {
  if (projectOrigin) {
    // Normalize both sides — strip trailing slash, compare lowercase
    const normalize = (o: string) => o.replace(/\/$/, "").toLowerCase();
    return normalize(origin) === normalize(projectOrigin);
  }
  return FALLBACK_ORIGINS.includes(origin);
}

function getCorsHeaders(
  req: Request,
  projectOrigin: string | null,
): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = isOriginAllowed(origin, projectOrigin);

  return {
    "Access-Control-Allow-Origin": allowed
      ? origin
      : (projectOrigin ?? FALLBACK_ORIGINS[0]),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  // For preflight we need the project ID to look up its allowed origin.
  // If not present, fall back to null (uses fallback origins).
  const projectId = new URL(req.url).searchParams.get("project");
  let projectOrigin: string | null = null;

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      // NOTE: keep select minimal, but include allowedOrigin
      select: { allowedOrigin: true },
    });
    projectOrigin = project?.allowedOrigin ?? null;
  }

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req, projectOrigin),
  });
}

// GET /api/feedback — authenticated, returns all feedback for the current user
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "";
  const q = url.searchParams.get("q") ?? "";

  const feedback = await prisma.feedback.findMany({
    where: {
      project: { userId: session.user.id },
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { message: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { pageUrl: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    feedback.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      message: f.message,
      email: f.email ?? "",
      pageUrl: f.pageUrl ?? "",
      userAgent: f.userAgent ?? "",
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    })),
  );
}

// POST /api/feedback — public widget submission endpoint
export async function POST(req: Request) {
  let corsHeaders: Record<string, string> | undefined;
  try {

    const reqUrl = new URL(req.url);
    const queryParsed = projectQuerySchema.safeParse(
      Object.fromEntries(reqUrl.searchParams),
    );

    if (!queryParsed.success) {
      return NextResponse.json(
        { error: queryParsed.error.issues[0].message },
        { status: 400, headers: getCorsHeaders(req, null) },
      );
    }

    const { project: projectId } = queryParsed.data;

    // Look up project — needed for both CORS and existence check
    // If your generated Prisma types don't include allowedOrigin, regenerate Prisma client.
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, allowedOrigin: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404, headers: getCorsHeaders(req, null) },
      );
    }

    corsHeaders = getCorsHeaders(req, project.allowedOrigin);

    // Validate origin against project's allowed origin
    const origin = req.headers.get("origin") ?? "";
    if (!isOriginAllowed(origin, project.allowedOrigin)) {
      return NextResponse.json(
        { error: "Origin not allowed." },
        { status: 403, headers: corsHeaders },
      );
    }

    // Rate limit by project ID
    const rateLimit = await checkWidgetRateLimit(projectId);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { ...corsHeaders, ...rateLimitHeaders(rateLimit) },
        },
      );
    }

    const body = await req.json();
    const parsed = submitFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: corsHeaders },
      );
    }

    const { message, email, pageUrl, userAgent } = parsed.data;

    const feedback = await prisma.feedback.create({
      data: {
        projectId,
        message,
        email: email || null,
        pageUrl: pageUrl || null,
        userAgent: userAgent || null,
        status: "new",
      },
    });

    return NextResponse.json(
      { id: feedback.id, message: "Feedback received. Thank you!" },
      { status: 201, headers: corsHeaders },
    );
  } catch (e) {
    if (corsHeaders) {
      // Return error with CORS headers so widget can read it
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500, headers: corsHeaders },
      );
    }
    return handleError(e, "feedback/POST");
  }
}
