"use client";

import type { Feedback, Status } from "@/types";
import { FeedbackTable } from "@/components/feedback/feedback-table";

interface FeedbackTabProps {
  feedback:       Feedback[];
  isLoading:      boolean;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete:       (id: string) => void;
}

export function FeedbackTab({
  feedback,
  isLoading,
  onUpdateStatus,
  onDelete,
}: FeedbackTabProps) {
  return (
    <FeedbackTable
      feedback={feedback}
      isLoading={isLoading}
      onUpdateStatus={onUpdateStatus}
      onDelete={onDelete}
      // No projects prop — project filter not shown inside project detail
    />
  );
}