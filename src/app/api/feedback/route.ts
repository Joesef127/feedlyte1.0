import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { submitFeedbackSchema, projectQuerySchema } from "@/lib/validations";
import { feedbackRateLimit } from "@/lib/rate-limit";
import { getClientIp, handleError } from "@/lib/api-helpers";
import { get } from "http";

// CORS — public feedback submission endpoint
const ALLOWED_ORIGINS = [
  "https://feedlyte.vercel.app",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req) });
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
    }))
  );
}

// POST /api/feedback — public widget submission endpoint
export async function POST(req: Request) {
  // Rate limiting — 10 requests per 15 min per IP
  const ip = getClientIp(req);
  const limited = feedbackRateLimit(ip);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: getCorsHeaders(req) }
    );
  }

  try {
    const reqUrl = new URL(req.url);
    const queryParsed = projectQuerySchema.safeParse(
      Object.fromEntries(reqUrl.searchParams)
    );
    if (!queryParsed.success) {
      return NextResponse.json(
        { error: queryParsed.error.issues[0].message },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }
    const { project: projectId } = queryParsed.data;

    const body = await req.json();
    const parsed = submitFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    const { message, email, pageUrl, userAgent } = parsed.data;

    // Verify the project exists (public lookup by id)
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404, headers: getCorsHeaders(req) }
      );
    }

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
      { status: 201, headers: getCorsHeaders(req) }
    );
  } catch (e) {
    return handleError(e, "feedback/POST", getCorsHeaders(req));
  }
}
