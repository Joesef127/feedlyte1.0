import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Run all queries in parallel
    const [projects, feedbackStats, recentFeedback, topProjects] =
      await Promise.all([
        // All projects with counts
        prisma.project.findMany({
          where:   { userId },
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { feedback: true } },
            feedback: {
              where:  { status: "unreviewed" },
              select: { id: true },
            },
          },
        }),

        // Aggregate feedback stats
        prisma.feedback.groupBy({
          by:    ["status"],
          where: { project: { userId } },
          _count: { status: true },
        }),

        // Recent feedback (last 8)
        prisma.feedback.findMany({
          where:   { project: { userId } },
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
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take:    5,
        }),
      ]);

    // Build stats map from groupBy result
    const statsMap: Record<string, number> = {};
    for (const s of feedbackStats) {
      statsMap[s.status] = s._count.status;
    }

    const totalFeedback  = Object.values(statsMap).reduce((a, b) => a + b, 0);
    const unreviewed     = statsMap["unreviewed"] ?? 0;
    const reviewed       = statsMap["reviewed"]   ?? 0;
    const resolved       = statsMap["resolved"]   ?? 0;

    return NextResponse.json({
      stats: {
        totalProjects:  projects.length,
        totalFeedback,
        unreviewed,
        reviewed,
        resolved,
      },
      recentProjects: projects.slice(0, 5).map((p) => ({
        id:            p.id,
        name:          p.name,
        color:         p.color,
        feedbackCount: p._count.feedback,
        unreviewedCount: p.feedback.length,
        createdAt:     p.createdAt.toISOString(),
      })),
      recentFeedback: recentFeedback.map((f) => ({
        id:        f.id,
        message:   f.message,
        status:    f.status,
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