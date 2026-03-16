import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { submitFeedbackSchema, projectQuerySchema } from "@/lib/validations";
import { feedbackRateLimit } from "@/lib/rate-limit";
import { getClientIp, handleError } from "@/lib/api-helpers";

// CORS headers for the public feedback submission endpoint
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://feedlyte.vercel.app, http://localhost:3000", // allow only our frontend to submit feedback
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
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
      { status: 429, headers: CORS_HEADERS }
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
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const { project: projectId } = queryParsed.data;

    const body = await req.json();
    const parsed = submitFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { message, email, pageUrl, userAgent } = parsed.data;

    // Verify the project exists (public lookup by id)
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404, headers: CORS_HEADERS }
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
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (e) {
    return handleError(e, "feedback/POST", CORS_HEADERS);
  }
}
