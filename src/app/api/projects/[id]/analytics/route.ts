import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const feedback = await prisma.feedback.findMany({
      where:   { projectId: id },
      orderBy: { createdAt: "asc" },
      select:  { id: true, status: true, pageUrl: true, createdAt: true },
    });

    // ── Volume over last 30 days ──────────────────────────────────────────────
    const now      = new Date();
    const day30ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyMap: Record<string, number> = {};
    for (let d = new Date(day30ago); d <= now; d.setDate(d.getDate() + 1)) {
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const f of feedback) {
      const day = f.createdAt.toISOString().slice(0, 10);
      if (day in dailyMap) dailyMap[day] = (dailyMap[day] ?? 0) + 1;
    }
    const volumeByDay = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    // ── Status breakdown ─────────────────────────────────────────────────────
    const statusMap: Record<string, number> = {
      unreviewed: 0,
      reviewed:   0,
      resolved:   0,
    };
    for (const f of feedback) {
      if (f.status in statusMap) statusMap[f.status]++;
    }
    const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // ── Top pages ────────────────────────────────────────────────────────────
    const pageMap: Record<string, number> = {};
    for (const f of feedback) {
      if (!f.pageUrl) continue;
      try {
        const path = new URL(f.pageUrl).pathname || f.pageUrl;
        pageMap[path] = (pageMap[path] ?? 0) + 1;
      } catch {
        pageMap[f.pageUrl] = (pageMap[f.pageUrl] ?? 0) + 1;
      }
    }
    const topPages = Object.entries(pageMap)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ── Submissions by day of week ────────────────────────────────────────────
    const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dowMap     = [0, 0, 0, 0, 0, 0, 0];
    for (const f of feedback) {
      dowMap[f.createdAt.getDay()]++;
    }
    const byDayOfWeek = DOW_LABELS.map((label, i) => ({
      label,
      count: dowMap[i],
    }));

    return NextResponse.json({
      total:          feedback.length,
      volumeByDay,
      statusBreakdown,
      topPages,
      byDayOfWeek,
    });
  } catch (e) {
    return handleError(e, "GET /api/projects/[id]/analytics");
  }
}