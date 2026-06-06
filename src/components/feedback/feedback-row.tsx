"use client";

import { useRouter } from "next/navigation";
import type { Feedback } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface FeedbackRowProps {
  fb: Feedback;
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Just now";
}

export function FeedbackRow({ fb }: FeedbackRowProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/dashboard/feedback/${fb.id}`)}
      className="bg-card border border-border rounded-[10px] px-4 py-3.5 flex items-start gap-3.5 cursor-pointer hover:border-border/60 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium leading-relaxed mb-1.5 line-clamp-2">
          {fb.message}
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          {fb.pageUrl && (
            <span className="text-xs text-muted-foreground/50 font-mono truncate max-w-[240px]">
              {fb.pageUrl}
            </span>
          )}
          {fb.email && (
            <span className="text-xs text-muted-foreground">{fb.email}</span>
          )}
          <span className="text-xs text-muted-foreground/40">
            {timeAgo(fb.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <StatusBadge status={fb.status} />
      </div>
    </div>
  );
}