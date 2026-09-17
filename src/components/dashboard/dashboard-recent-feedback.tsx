"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FeedbackRow } from "@/components/feedback/feedback-row";
import type { Feedback, Status } from "@/types";

interface DashboardRecentFeedbackProps {
  recentFeedback: Feedback[];
  projectMap: Record<string, { name: string; color: string }>;
  onUpdateStatus: (id: string, status: Status) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DashboardRecentFeedback({
  recentFeedback,
  projectMap,
  onUpdateStatus,
  onDelete,
}: DashboardRecentFeedbackProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
          Recent Feedback
        </h2>
        <Link
          href="/dashboard/feedback"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

      {!recentFeedback.length ? (
        <Card>
          <p className="text-sm text-muted-foreground text-center py-4">
            No feedback yet for this selection.
          </p>
        </Card>
      ) : (
        recentFeedback.slice(0, 6).map((fb) => (
          <FeedbackRow
            key={fb.id}
            fb={fb}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
            projectName={projectMap[fb.projectId]?.name}
            projectColor={projectMap[fb.projectId]?.color}
          />
        ))
      )}
    </div>
  );
}
