"use client";

import type { Feedback } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface FeedbackRowProps {
  fb: Feedback;
  onSelect: () => void;
}

export function FeedbackRow({ fb, onSelect }: FeedbackRowProps) {
  return (
    <div
      onClick={onSelect}
      className="bg-card border border-border rounded-[10px] px-4 py-[14px] flex items-start gap-3.5 cursor-pointer hover:border-border/60 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium leading-relaxed mb-1.5 truncate overflow-hidden">
          {fb.message}
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          <span className="text-[11px] text-[#d3d0d0] font-mono">{fb.pageUrl}</span>
          {fb.email && (
            <span className="text-[11px] text-muted-foreground">{fb.email}</span>
          )}
          <span className="text-[11px] text-[#d3d0d0]">{fb.createdAt}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={fb.status} />
      </div>
    </div>
  );
}
