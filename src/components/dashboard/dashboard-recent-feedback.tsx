"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FeedbackRow } from "@/components/feedback/feedback-row";
import { EmptyState } from "@/components/ui/empty-state";
import type { Feedback, Status } from "@/types";

interface DashboardRecentFeedbackProps {
  recentFeedback: Feedback[];
  projectMap: Record<string, { name: string; color: string }>;
  timeframe?: "7d" | "30d" | "90d";
  onUpdateStatus: (id: string, status: Status) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DashboardRecentFeedback({
  recentFeedback,
  projectMap,
  timeframe,
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
        <Card className="p-2 sm:p-4">
          <EmptyState
            icon={<MessageSquare size={22} />}
            title="No feedback received yet"
            description={
              timeframe
                ? `No feedback submissions recorded in the last ${
                    timeframe === "7d" ? "7 days" : timeframe === "90d" ? "90 days" : "30 days"
                  }.`
                : "When users submit feedback through your embedded widget, it will appear here in real time."
            }
          />
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
