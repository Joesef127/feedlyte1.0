import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashTrackingToken } from "@/lib/tracking-token";
import { checkTrackingRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { handleError, withApiVersionHeaders } from "@/lib/api-helpers";

function getTrustedClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",").map((value) => value.trim()).find(Boolean);
    if (first && first !== "unknown") return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp !== "unknown") return realIp.trim();
  return "unknown";
}

// Public — no auth. Lets an anonymous submitter check the status of the single
// feedback item their one-time tracking link points to. Only exposes the
// minimal, non-sensitive fields needed to show progress.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || token.length > 128) {
      return NextResponse.json(
        { error: "Invalid tracking link." },
        { status: 400, headers: withApiVersionHeaders() },
      );
    }

    const clientIp = getTrustedClientIp(req);
    const rateLimit = await checkTrackingRateLimit(clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: withApiVersionHeaders(rateLimitHeaders(rateLimit)) },
      );
    }

    const tokenHash = hashTrackingToken(token);
    const feedback = await prisma.feedback.findUnique({
      where: { trackingTokenHash: tokenHash },
      select: {
        status: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        trackingTokenExpiresAt: true,
      },
    });

    if (!feedback || (feedback.trackingTokenExpiresAt && feedback.trackingTokenExpiresAt < new Date())) {
      return NextResponse.json(
        { error: "This tracking link is invalid or has expired." },
        { status: 404, headers: withApiVersionHeaders() },
      );
    }

    return NextResponse.json(
      {
        status: feedback.status,
        category: feedback.category ?? null,
        submittedAt: feedback.createdAt.toISOString(),
        updatedAt: feedback.updatedAt.toISOString(),
      },
      { headers: withApiVersionHeaders() },
    );
  } catch (e) {
    return handleError(e, "feedback/track/[token]/GET");
  }
}
