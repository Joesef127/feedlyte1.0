"use client";

import { Timer, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeedbackResolutionMetricsProps {
  resolutionDuration: string | null;
  openDuration: string;
  firstResponseDuration: string | null;
}

export function FeedbackResolutionMetrics({
  resolutionDuration,
  openDuration,
  firstResponseDuration,
}: FeedbackResolutionMetricsProps) {
  return (
    <Card>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Timer size={14} className="text-primary" />
        Resolution & Response Times
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-background rounded-lg border border-border">
          <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-1">
            Time to Resolve
          </p>
          {resolutionDuration ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {resolutionDuration}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Open ({openDuration})
              </span>
            </div>
          )}
        </div>

        <div className="p-3 bg-background rounded-lg border border-border">
          <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-1">
            First Team Response
          </p>
          {firstResponseDuration ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {firstResponseDuration}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground/50">
              Awaiting response
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
