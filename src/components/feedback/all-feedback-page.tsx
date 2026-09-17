"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, BarChart3 } from "lucide-react";
import { FeedbackTable } from "./feedback-table";
import {
  useAllFeedback,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/use-feedback";
import { useProjects } from "@/hooks/use-projects";
import type { FilterOption } from "@/components/ui/filter-dropdown";
import { ProjectStats } from "../projects/project-stats";
import { MetricsPage } from "@/components/metrics/metrics-page";

export function AllFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "metrics" ? "metrics" : "feedback";
  const [activeTab, setActiveTab] = useState<"feedback" | "metrics">(initialTab);

  const { data: feedback = [], isLoading } = useAllFeedback();
  const { data: projects = [] } = useProjects();
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFb = useDeleteFeedback();

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl === "metrics" || tabFromUrl === "feedback") {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: "feedback" | "metrics") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "metrics") {
      params.set("tab", "metrics");
    } else {
      params.delete("tab");
    }
    const query = params.toString();
    const newUrl = query ? `/dashboard/feedback?${query}` : "/dashboard/feedback";
    window.history.replaceState(null, "", newUrl);
  };

  // Build project filter options and project lookup map
  const projectOptions: FilterOption[] = useMemo(
    () => projects.map((p) => ({ id: p.id, label: p.name, dot: p.color })),
    [projects],
  );

  const projectMap = useMemo(
    () =>
      Object.fromEntries(
        projects.map((p) => [p.id, { name: p.name, color: p.color }]),
      ),
    [projects],
  );

  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-[-0.03em] m-0">
          All Feedback
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 m-0">
          {feedback.length} total entr{feedback.length !== 1 ? "ies" : "y"}{" "}
          across {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border mb-6">
        <button
          type="button"
          onClick={() => handleTabChange("feedback")}
          className={[
            "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer",
            activeTab === "feedback"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <MessageSquare size={16} />
          <span>Feedback</span>
          {feedback.length > 0 && (
            <span
              className={[
                "ml-1 text-xs px-2 py-0.5 rounded-full font-medium",
                activeTab === "feedback"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {feedback.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("metrics")}
          className={[
            "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer",
            activeTab === "metrics"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <BarChart3 size={16} />
          <span>Metrics</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "feedback" ? (
        <>
          <ProjectStats
            feedback={feedback}
            isLoading={isLoading}
            projects={projects.map((p) => p.id)}
          />
          <FeedbackTable
            feedback={feedback}
            isLoading={isLoading}
            onUpdateStatus={(id, status) => updateStatus.mutateAsync({ id, status })}
            onDelete={(id) => deleteFb.mutateAsync(id)}
            projects={projectOptions}
            projectMap={projectMap}
          />
        </>
      ) : (
        <MetricsPage embedded />
      )}
    </div>
  );
}
