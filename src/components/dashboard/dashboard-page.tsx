"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/use-feedback";
import type { Feedback, Status } from "@/types";

import { DashboardHeader } from "./dashboard-header";
import { DashboardFilterBar } from "./dashboard-filter-bar";
import { DashboardStatsGrid } from "./dashboard-stats-grid";
import { DashboardActivityChart } from "./dashboard-activity-chart";
import { DashboardDistributionCard } from "./dashboard-distribution-card";
import { DashboardRecentFeedback } from "./dashboard-recent-feedback";
import { DashboardRecentProjects } from "./dashboard-recent-projects";
import { CreateProjectModal } from "./create-project-modal";

export function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Filters state
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const [distributionView, setDistributionView] = useState<"status" | "category">("status");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useDashboard({
    project: selectedProject,
    timeframe,
  });

  const updateStatus = useUpdateFeedbackStatus();
  const deleteFb = useDeleteFeedback();

  const projectMap = useMemo(() => {
    const projects = data?.recentProjects ?? [];
    return Object.fromEntries(
      projects.map((p) => [p.id, { name: p.name, color: p.color }]),
    );
  }, [data?.recentProjects]);

  const allProjects = useMemo(() => {
    return data?.allProjects ?? data?.recentProjects ?? [];
  }, [data?.allProjects, data?.recentProjects]);

  const recentFeedback: Feedback[] = useMemo(() => {
    const feedback = data?.recentFeedback ?? [];
    return feedback.map((f) => ({
      id: f.id,
      projectId: f.project.id,
      message: f.message,
      email: "",
      pageUrl: "",
      userAgent: "",
      status: f.status as Status,
      createdAt: f.createdAt,
    }));
  }, [data?.recentFeedback]);

  // Distribution counts
  const activeStatuses = useMemo(() => {
    return (data?.statusDistribution ?? []).filter((s) => s.count > 0);
  }, [data?.statusDistribution]);

  const activeCategories = useMemo(() => {
    return (data?.categoryDistribution ?? []).filter((c) => c.count > 0);
  }, [data?.categoryDistribution]);

  const trendData = data?.feedbackTrend ?? [];
  const unreviewed = data?.stats.unreviewed ?? 0;
  const projectsCount = data?.stats.totalProjects ?? 0;
  const totalFeedback = data?.stats.totalFeedback ?? 0;
  const resolutionRate = data?.stats.resolutionRate ?? 0;

  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      <DashboardHeader
        userName={session?.user?.name}
        unreviewedCount={unreviewed}
        projectsCount={projectsCount}
        onNewProject={() => setShowModal(true)}
      />

      <DashboardFilterBar
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        projects={allProjects}
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
      />

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading dashboard...
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <DashboardStatsGrid
            totalProjects={projectsCount}
            totalFeedback={totalFeedback}
            unreviewed={unreviewed}
            reviewed={data?.stats.reviewed ?? 0}
            resolved={data?.stats.resolved ?? 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DashboardActivityChart
              trendData={trendData}
              resolutionRate={resolutionRate}
              timeframe={timeframe}
            />

            <DashboardDistributionCard
              distributionView={distributionView}
              onViewChange={setDistributionView}
              activeStatuses={activeStatuses}
              activeCategories={activeCategories}
              totalFeedback={totalFeedback}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            <div className="flex flex-col gap-6 xl:col-span-2">
              <DashboardRecentFeedback
                recentFeedback={recentFeedback}
                projectMap={projectMap}
                onUpdateStatus={async (id, status) => {
                  await updateStatus.mutateAsync({ id, status });
                }}
                onDelete={async (id) => {
                  await deleteFb.mutateAsync(id);
                }}
              />
            </div>

            <div className="flex flex-col gap-6 xl:gap-8">
              <DashboardRecentProjects
                recentProjects={data?.recentProjects ?? []}
                onNewProject={() => setShowModal(true)}
              />
            </div>
          </div>
        </div>
      )}

      <CreateProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(projectId) =>
          router.push(`/dashboard/projects/${projectId}`)
        }
      />
    </div>
  );
}
