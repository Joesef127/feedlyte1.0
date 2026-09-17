import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";

function parseTechnicalDetails(value: string | null): Record<string, string> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unreviewed:   { label: "Unreviewed",   color: "#F59E0B" },
  in_review:    { label: "In Review",    color: "#3B82F6" },
  reviewed:     { label: "Reviewed",     color: "#3B82F6" },
  in_progress:  { label: "In Progress",  color: "#8B5CF6" },
  accepted:     { label: "Accepted",     color: "#10B981" },
  resolved:     { label: "Resolved",     color: "#22C55E" },
  not_feasible: { label: "Not Feasible", color: "#64748B" },
  closed:       { label: "Closed",       color: "#94A3B8" },
  spam:         { label: "Spam",         color: "#EF4444" },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  bug:      { label: "Bug",       color: "#EF4444" },
  idea:     { label: "Idea",      color: "#8B5CF6" },
  praise:   { label: "Praise",    color: "#10B981" },
  question: { label: "Question",  color: "#3B82F6" },
  general:  { label: "General",   color: "#64748B" },
};

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project") || undefined;
    const timeframeParam = searchParams.get("timeframe");
    const timeframeDays = timeframeParam === "7d" ? 7 : timeframeParam === "90d" ? 90 : 30;

    const now = new Date();
    const timeframeDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Feedback where clause: matches user's projects, and optionally a specific project
    const feedbackWhere = projectId
      ? { project: { id: projectId, userId } }
      : { project: { userId } };

    // Run queries in parallel
    const [allUserProjects, feedbackStats, categoryStats, recentFeedback, topProjects, trendFeedback] =
      await Promise.all([
        // All projects with feedback count
        prisma.project.findMany({
          where:   { userId },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            color: true,
            createdAt: true,
            _count: { select: { feedback: true } },
            feedback: {
              where:  { status: "unreviewed" },
              select: { id: true },
            },
          },
        }),

        // Feedback status aggregation
        prisma.feedback.groupBy({
          by:    ["status"],
          where: feedbackWhere,
          _count: { status: true },
        }),

        // Feedback category aggregation
        prisma.feedback.groupBy({
          by:    ["category"],
          where: { ...feedbackWhere, category: { not: null } },
          _count: { category: true },
        }),

        // Recent feedback (last 8)
        prisma.feedback.findMany({
          where:   feedbackWhere,
          orderBy: { createdAt: "desc" },
          take:    8,
          include: {
            project: { select: { id: true, name: true, color: true } },
          },
        }),

        // Top projects by feedback count (last 30 days)
        prisma.project.findMany({
          where:   { userId },
          include: {
            _count: { select: { feedback: true } },
            feedback: {
              where: {
                createdAt: { gte: thirtyDaysAgo },
              },
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take:    5,
        }),

        // Feedback for trend chart (within timeframe)
        prisma.feedback.findMany({
          where: {
            ...feedbackWhere,
            createdAt: { gte: timeframeDate },
          },
          select: { createdAt: true, status: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // Build stats map from groupBy result
    const statsMap: Record<string, number> = {};
    for (const s of feedbackStats) {
      statsMap[s.status] = s._count.status;
    }

    const unreviewed   = statsMap["unreviewed"] ?? 0;
    const inReview     = (statsMap["in_review"] ?? 0) + (statsMap["reviewed"] ?? 0);
    const accepted     = statsMap["accepted"] ?? 0;
    const inProgress   = statsMap["in_progress"] ?? 0;
    const resolved     = statsMap["resolved"] ?? 0;
    const notFeasible  = statsMap["not_feasible"] ?? 0;
    const closed       = statsMap["closed"] ?? 0;
    const spam         = statsMap["spam"] ?? 0;

    // Total feedback excludes spam
    const totalFeedback = unreviewed + inReview + accepted + inProgress + resolved + notFeasible + closed;
    const resolutionRate = totalFeedback > 0 ? Math.round((resolved / totalFeedback) * 100) : 0;

    // Status distribution
    const statusDistribution = Object.entries(statsMap)
      .filter(([status, count]) => count > 0 && status !== "spam")
      .map(([status, count]) => {
        const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#94A3B8" };
        return {
          status,
          label: cfg.label,
          color: cfg.color,
          count,
        };
      });

    // Category distribution
    const categoryDistribution = categoryStats
      .filter((c) => c.category && c._count.category > 0)
      .map((c) => {
        const catKey = c.category?.toLowerCase() ?? "general";
        const cfg = CATEGORY_CONFIG[catKey] ?? { label: c.category ?? "General", color: "#64748B" };
        return {
          category: catKey,
          label: cfg.label,
          color: cfg.color,
          count: c._count.category,
        };
      });

    // Timeframe volume trend daily map
    const dailyMap: Record<string, { count: number; resolved: number }> = {};
    for (let d = new Date(timeframeDate); d <= now; d.setDate(d.getDate() + 1)) {
      dailyMap[d.toISOString().slice(0, 10)] = { count: 0, resolved: 0 };
    }
    for (const f of trendFeedback) {
      const day = f.createdAt.toISOString().slice(0, 10);
      if (day in dailyMap) {
        dailyMap[day].count += 1;
        if (f.status === "resolved") {
          dailyMap[day].resolved += 1;
        }
      }
    }

    const feedbackTrend = Object.entries(dailyMap).map(([date, data]) => {
      const d = new Date(date + "T00:00:00");
      return {
        date,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: data.count,
        resolved: data.resolved,
      };
    });

    return NextResponse.json({
      stats: {
        totalProjects:  allUserProjects.length,
        totalFeedback,
        unreviewed,
        reviewed: inReview, // backward-compat alias
        in_review: inReview,
        accepted,
        in_progress: inProgress,
        resolved,
        not_feasible: notFeasible,
        closed,
        spam,
        resolutionRate,
      },
      feedbackTrend,
      statusDistribution,
      categoryDistribution,
      allProjects: allUserProjects.map((p) => ({
        id:    p.id,
        name:  p.name,
        color: p.color,
      })),
      recentProjects: allUserProjects.slice(0, 5).map((p) => ({
        id:              p.id,
        name:            p.name,
        color:           p.color,
        feedbackCount:   p._count.feedback,
        unreviewedCount: p.feedback.length,
        createdAt:       p.createdAt.toISOString(),
      })),
      recentFeedback: recentFeedback.map((f) => ({
        id:        f.id,
        message:   f.message,
        status:    f.status,
        category:  f.category ?? null,
        rating:    f.rating ?? null,
        technicalDetails: parseTechnicalDetails(f.technicalDetails),
        createdAt: f.createdAt.toISOString(),
        project: {
          id:    f.project.id,
          name:  f.project.name,
          color: f.project.color,
        },
      })),
      topProjects: topProjects
        .map((p) => ({
          id:             p.id,
          name:           p.name,
          color:          p.color,
          totalFeedback:  p._count.feedback,
          last30Days:     p.feedback.length,
        }))
        .sort((a, b) => b.last30Days - a.last30Days)
        .slice(0, 5),
    });
  } catch (e) {
    return handleError(e, "GET /api/dashboard");
  }
}