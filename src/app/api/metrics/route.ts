import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";

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
  feature:  { label: "Feature",   color: "#3B82F6" },
  idea:     { label: "Idea",      color: "#8B5CF6" },
  praise:   { label: "Praise",    color: "#10B981" },
  question: { label: "Question",  color: "#F59E0B" },
  general:  { label: "General",   color: "#64748B" },
  other:    { label: "Other",     color: "#94A3B8" },
};

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const rawDays = searchParams.get("days");
    const days = rawDays === "7" ? 7 : rawDays === "90" ? 90 : 30;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch projects and feedback for user
    const [projects, feedback] = await Promise.all([
      prisma.project.findMany({
        where: { userId },
        select: { id: true, name: true, color: true },
        orderBy: { name: "asc" },
      }),
      prisma.feedback.findMany({
        where: {
          project: { userId },
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          projectId: true,
          status: true,
          category: true,
          rating: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const total = feedback.length;
    let unreviewed = 0;
    let resolved = 0;
    let inProgress = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let totalResolutionHours = 0;
    let resolvedCountWithTime = 0;

    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const projectCounts: Record<string, number> = {};

    for (const f of feedback) {
      // Status counting
      statusCounts[f.status] = (statusCounts[f.status] ?? 0) + 1;
      if (f.status === "unreviewed") unreviewed++;
      if (f.status === "resolved") {
        resolved++;
        const resTimeMs = f.updatedAt.getTime() - f.createdAt.getTime();
        if (resTimeMs > 60 * 1000) {
          totalResolutionHours += resTimeMs / (1000 * 60 * 60);
          resolvedCountWithTime++;
        }
      }
      if (f.status === "in_progress") inProgress++;

      // Category counting
      const cat = f.category?.toLowerCase() || "other";
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;

      // Project counting
      projectCounts[f.projectId] = (projectCounts[f.projectId] ?? 0) + 1;

      // Rating
      if (typeof f.rating === "number" && f.rating > 0) {
        ratingSum += f.rating;
        ratingCount++;
      }
    }

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgRating = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : null;
    
    let avgResolutionTime = "N/A";
    if (resolvedCountWithTime > 0) {
      const avgHours = totalResolutionHours / resolvedCountWithTime;
      if (avgHours < 24) {
        avgResolutionTime = `${avgHours.toFixed(1)} hrs`;
      } else {
        avgResolutionTime = `${(avgHours / 24).toFixed(1)} days`;
      }
    }

    // Daily volume trend
    const dailyMap: Record<string, number> = {};
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const f of feedback) {
      const day = f.createdAt.toISOString().slice(0, 10);
      if (day in dailyMap) {
        dailyMap[day] = (dailyMap[day] ?? 0) + 1;
      }
    }

    const volumeTrend = Object.entries(dailyMap).map(([date, count]) => {
      const d = new Date(date + "T00:00:00");
      return {
        date,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      };
    });

    // Status breakdown
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => {
      const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#94A3B8" };
      return {
        status,
        label: cfg.label,
        color: cfg.color,
        count,
      };
    });

    // Category breakdown
    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => {
      const cfg = CATEGORY_CONFIG[category] ?? { label: category, color: "#94A3B8" };
      return {
        category,
        label: cfg.label,
        color: cfg.color,
        count,
      };
    }).sort((a, b) => b.count - a.count);

    // Project breakdown
    const projectVolume = projects.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      count: projectCounts[p.id] ?? 0,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      days,
      kpis: {
        totalFeedback: total,
        unreviewed,
        inProgress,
        resolved,
        resolutionRate,
        avgRating,
        avgResolutionTime,
        activeProjects: projects.length,
      },
      volumeTrend,
      statusDistribution,
      categoryDistribution,
      projectVolume,
    });
  } catch (e) {
    return handleError(e, "GET /api/metrics");
  }
}
