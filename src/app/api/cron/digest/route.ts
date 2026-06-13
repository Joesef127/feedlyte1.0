import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendDailyDigestEmail, createUnsubscribeToken } from "@/lib/email";

function is8AMInTimezone(timezone: string): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
    const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");
    // Run at 8:00-8:15 AM local time (cron runs hourly at :00)
    return hour === 8 && minute <= 15;
  } catch {
    return false;
  }
}

function getLocalDateKey(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // YYYY-MM-DD in project's timezone
  } catch {
    return date.toISOString().split("T")[0]; // fallback to UTC
  }
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find projects with daily digest enabled
    const projects = await prisma.project.findMany({
      where: { digestFrequency: "daily" },
      select: {
        id: true,
        name: true,
        timezone: true,
        unsubscribeToken: true,
        userId: true,
        lastDigestSentAt: true,
        user: { select: { email: true } },
      },
    });

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter projects where it's 8 AM in their timezone
    const eligibleProjects = projects.filter(p => is8AMInTimezone(p.timezone || "UTC"));

    const results = await Promise.allSettled(
      eligibleProjects.map(async (project) => {
        if (!project.user?.email) {
          return { skipped: true, reason: "no_user_email" };
        }

        // Check if already sent for today in project's timezone
        const tz = project.timezone || "UTC";
        const todayKey = getLocalDateKey(tz);
        const lastSent = project.lastDigestSentAt;
        if (lastSent) {
          const lastSentKey = getLocalDateKey(tz, new Date(lastSent));
          if (lastSentKey === todayKey) {
            return { skipped: true, reason: "already_sent_today" };
          }
        }

        // Get feedback from last 24 hours
        const feedback = await prisma.feedback.findMany({
          where: {
            projectId: project.id,
            createdAt: { gte: twentyFourHoursAgo },
          },
          orderBy: { createdAt: "desc" },
        });

        if (feedback.length === 0) {
          return { skipped: true, reason: "no_new_feedback" };
        }

        // Ensure unsubscribe token exists
        let unsubscribeToken = project.unsubscribeToken;
        if (!unsubscribeToken) {
          unsubscribeToken = await createUnsubscribeToken(project.id);
          await prisma.project.update({
            where: { id: project.id },
            data: { unsubscribeToken },
          });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;
        const dashboardUrl = `${baseUrl}/dashboard/projects/${project.id}`;
        await sendDailyDigestEmail(
          project.user.email,
          project.name,
          feedback.map(f => ({
            message: f.message,
            email: f.email,
            pageUrl: f.pageUrl,
            status: f.status,
            createdAt: f.createdAt.toISOString(),
          })),
          dashboardUrl,
          unsubscribeUrl
        );

        // Mark as sent for today (atomic update with conditional)
        await prisma.project.update({
          where: { id: project.id },
          data: { lastDigestSentAt: now },
        });

        return { sent: true };
      })
    );

    const sent = results.filter(r => r.status === "fulfilled" && r.value?.sent).length;
    const skipped = results.filter(r => r.status === "fulfilled" && r.value?.skipped).length;
    const failed = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({ 
      message: `Digest sent for ${sent} project(s), ${skipped} skipped`,
      failed,
      checked: projects.length,
      eligible: eligibleProjects.length,
      sent,
      skipped,
    });
  } catch (error) {
    console.error("[cron/digest] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}