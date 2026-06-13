import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { submitFeedbackSchema, projectQuerySchema } from "@/lib/validations";
import { checkWidgetRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { handleError } from "@/lib/api-helpers";
import { fireWebhooks } from "@/lib/webhooks";
import { createUnsubscribeToken, sendFeedbackNotificationEmail } from "@/lib/email";

const FALLBACK_ORIGINS = [
  "https://feedlyte.vercel.app",
  "http://localhost:3000",
];

function isOriginAllowed(
  origin: string,
  projectOrigin: string | null,
): boolean {
  if (projectOrigin) {
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
  const projectId = new URL(req.url).searchParams.get("project");
  let projectOrigin: string | null = null;
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { allowedOrigin: true },
    });
    projectOrigin = project?.allowedOrigin ?? null;
  }
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req, projectOrigin),
  });
}

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

export async function POST(req: Request) {
  try {
    const reqUrl = new URL(req.url);
    const queryParsed = projectQuerySchema.safeParse(
      Object.fromEntries(reqUrl.searchParams),
    );

    if (!queryParsed.success) {
      const corsHeaders = getCorsHeaders(req, null);
      return NextResponse.json(
        { error: queryParsed.error.issues[0].message },
        { status: 400, headers: corsHeaders },
      );
    }

    const { project: projectId } = queryParsed.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, allowedOrigin: true },
    });

    if (!project) {
      const corsHeaders = getCorsHeaders(req, null);
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404, headers: corsHeaders },
      );
    }

    const corsHeaders = getCorsHeaders(req, project.allowedOrigin);
    const origin = req.headers.get("origin") ?? "";

    if (!isOriginAllowed(origin, project.allowedOrigin)) {
      return NextResponse.json(
        { error: "Origin not allowed." },
        { status: 403, headers: corsHeaders },
      );
    }

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
        status: "unreviewed",
      },
    });

    // Fetch project with notification preferences (for background notification work)
    const projectWithPrefs = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        name: true, 
        userId: true,
        notifyOnSubmission: true,
        notificationCooldown: true,
        lastNotificationSent: true,
        unsubscribeToken: true,
        user: { select: { email: true } }
      },
    });

    // Background notification work - decoupled from feedback response
    // Runs async without blocking the API response
    if (projectWithPrefs?.notifyOnSubmission && projectWithPrefs.user?.email) {
      // Use atomic conditional update to "claim" the send window
      // Only updates if cooldown condition is met (prevents race conditions)
      const now = new Date();
      const cooldown = projectWithPrefs.notificationCooldown;
      const lastSent = projectWithPrefs.lastNotificationSent;
      
      let shouldSend = true;
      let cooldownMs = 0;
      
      if (cooldown !== "none" && lastSent) {
        cooldownMs = {
          "5min": 5 * 60 * 1000,
          "15min": 15 * 60 * 1000,
          "30min": 30 * 60 * 1000,
          "1hour": 60 * 60 * 1000,
        }[cooldown] || 0;
        shouldSend = (now.getTime() - lastSent.getTime()) >= cooldownMs;
      }

      if (shouldSend) {
        // Atomic conditional update: only set lastNotificationSent if cooldown passed
        // This replaces the read-then-write with a single atomic operation
        const updateResult = await prisma.project.updateMany({
          where: {
            id: projectId,
            ...(cooldown !== "none" && lastSent
              ? {
                  lastNotificationSent: {
                    lte: new Date(now.getTime() - cooldownMs),
                  },
                }
              : {}),
          },
          data: { lastNotificationSent: now },
        });

        // updateResult.count > 0 means we "claimed" the send window
        if (updateResult.count > 0) {
          // Generate unsubscribe token if not exists
          let unsubscribeToken = projectWithPrefs.unsubscribeToken;
          if (!unsubscribeToken) {
            unsubscribeToken = await createUnsubscribeToken(projectId);
            await prisma.project.update({
              where: { id: projectId },
              data: { unsubscribeToken },
            });
          }
          
          const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;
          const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}`;
          
          // Fire async - errors are caught and logged, don't affect feedback response
          sendFeedbackNotificationEmail(
            projectWithPrefs.user.email,
            projectWithPrefs.name,
            {
              message: feedback.message,
              email: feedback.email,
              pageUrl: feedback.pageUrl,
              userAgent: feedback.userAgent,
              createdAt: feedback.createdAt.toISOString(),
            },
            dashboardUrl,
            unsubscribeUrl
          ).catch((err) => console.error("[feedback] Failed to send notification email:", err));
        }
      }
    }



    // Fire webhooks async — does not block the response
    fireWebhooks({
      id: feedback.id,
      projectId: feedback.projectId,
      message: feedback.message,
      email: feedback.email,
      pageUrl: feedback.pageUrl,
      status: feedback.status,
      createdAt: feedback.createdAt.toISOString(),
    }).catch(() => {});

    return NextResponse.json(
      { id: feedback.id, message: "Feedback received. Thank you!" },
      { status: 201, headers: corsHeaders },
    );
  } catch (e) {
    return handleError(e, "feedback/POST");
  }
}
