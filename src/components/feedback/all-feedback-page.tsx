"use client";

import { FeedbackTable } from "./feedback-table";
import { useAllFeedback, useUpdateFeedbackStatus, useDeleteFeedback } from "@/hooks/use-feedback";
import { useProjects } from "@/hooks/use-projects";

export function AllFeedbackPage() {
  const { data: feedback = [], isLoading } = useAllFeedback();
  const { data: projects = [] } = useProjects();
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFb = useDeleteFeedback();

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
          All Feedback
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1 m-0">
          {feedback.length} total entries across {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </div>
      <FeedbackTable
        feedback={feedback}
        isLoading={isLoading}
        onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
        onDelete={(id) => deleteFb.mutate(id)}
      />
    </div>
  );
}

