"use client";

import { useMemo } from "react";
import { FeedbackTable } from "./feedback-table";
import {
  useAllFeedback,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/use-feedback";
import { useProjects } from "@/hooks/use-projects";
import type { FilterOption } from "@/components/ui/filter-dropdown";
import { ProjectStats } from "../projects/project-stats";

export function AllFeedbackPage() {
  const { data: feedback = [], isLoading } = useAllFeedback();
  const { data: projects = [] } = useProjects();
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFb = useDeleteFeedback();

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
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground tracking-[-0.03em] m-0">
          All Feedback
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 m-0">
          {feedback.length} total entr{feedback.length !== 1 ? "ies" : "y"}{" "}
          across {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ProjectStats 
        feedback={feedback} 
        isLoading={isLoading} 
        projects={projects.map(p => p.id)}
      />
      <FeedbackTable
        feedback={feedback}
        isLoading={isLoading}
        onUpdateStatus={(id, status) => updateStatus.mutateAsync({ id, status })}
        onDelete={(id) => deleteFb.mutateAsync(id)}
        projects={projectOptions}
        projectMap={projectMap}
      />
    </div>
  );
}
