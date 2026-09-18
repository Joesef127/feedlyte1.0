"use client";

import { Card } from "@/components/ui/card";
import type { Status } from "@/types";
import { ALL_STATUSES } from "./feedback-detail-utils";

interface FeedbackStatusSelectorProps {
  currentStatus: Status;
  onStatusSelect: (status: Status) => void;
  isPending?: boolean;
}

export function FeedbackStatusSelector({
  currentStatus,
  onStatusSelect,
  isPending = false,
}: FeedbackStatusSelectorProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Update Status
        </h3>
        <span className="text-xs text-muted-foreground/60">
          Current:{" "}
          <span className="font-semibold text-foreground capitalize">
            {currentStatus.replace("_", " ")}
          </span>
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => {
          const isActive =
            currentStatus === s.id ||
            (s.id === "in_review" && currentStatus === "reviewed");

          return (
            <button
              key={s.id}
              onClick={() => onStatusSelect(s.id)}
              disabled={isActive || isPending}
              className={[
                "px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all",
                isActive
                  ? "border-primary bg-primary/10 text-primary cursor-default"
                  : "border-border bg-transparent text-muted-foreground hover:border-border/80 hover:text-foreground disabled:opacity-50",
              ].join(" ")}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
