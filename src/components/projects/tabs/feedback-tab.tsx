"use client";

import type { Feedback, Status } from "@/types";
import { FeedbackTable } from "@/components/feedback/feedback-table";
import { FeedbackTableLoading } from "./loading";

interface FeedbackTabProps {
  feedback:       Feedback[];
  isLoading:      boolean;
  onUpdateStatus: (id: string, status: Status) => Promise<void>;
  onDelete:       (id: string) => Promise<void>;
}

export function FeedbackTab({
  feedback,
  isLoading,
  onUpdateStatus,
  onDelete,
}: FeedbackTabProps) {
  if (isLoading) {
    return <FeedbackTableLoading />;
  }

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