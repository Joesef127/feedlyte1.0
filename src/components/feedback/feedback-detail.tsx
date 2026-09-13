"use client";

import { Trash2, Bug, Lightbulb, Heart, HelpCircle, Star } from "lucide-react";
import type { Feedback, Status } from "@/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

const CATEGORY_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  idea: Lightbulb,
  praise: Heart,
  question: HelpCircle,
};

interface FeedbackDetailProps {
  fb: Feedback;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

const META_FIELDS: [string, keyof Feedback][] = [
  ["Page URL", "pageUrl"],
  ["User Agent", "userAgent"],
  ["Email", "email"],
  ["Submitted", "createdAt"],
];

export function FeedbackDetail({ fb, onUpdateStatus, onDelete }: FeedbackDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Message */}
      <div className="bg-background rounded-lg px-4 py-3.5">
        <p className="text-base text-foreground leading-relaxed m-0">{fb.message}</p>
      </div>

      {/* Category & rating — only shown when the submitter provided them */}
      {(fb.category || (typeof fb.rating === "number" && fb.rating > 0)) && (
        <div className="flex items-center gap-3 flex-wrap">
          {fb.category && CATEGORY_ICONS[fb.category] && (() => {
            const CategoryIcon = CATEGORY_ICONS[fb.category];
            return (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted/60 text-foreground border border-border capitalize">
                <CategoryIcon size={14} className="text-primary" />
                {fb.category}
              </span>
            );
          })()}
          {typeof fb.rating === "number" && fb.rating > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < fb.rating! ? "text-amber-500" : "text-muted-foreground/30"}
                    fill={i < fb.rating! ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="ml-1 text-xs font-medium text-foreground/80">({fb.rating}/5)</span>
            </div>
          )}
        </div>
      )}

      {/* Technical details — only shown when the submitter opted in */}
      {fb.technicalDetails && Object.keys(fb.technicalDetails).length > 0 && (
        <div>
          <p className="text-sm text-[#737373] font-medium uppercase tracking-[0.04em] mb-2">
            Technical Details
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(fb.technicalDetails).map(([label, value]) => (
              <div key={label} className="bg-background rounded-[7px] px-3 py-2.5">
                <p className="text-sm text-[#d3d0d0] font-semibold uppercase tracking-[0.06em] mb-1">
                  {label}
                </p>
                <p className="text-sm text-[#737373] font-mono break-all m-0">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2.5">
        {META_FIELDS.map(([label, key]) => (
          <div key={label} className="bg-background rounded-[7px] px-3 py-2.5">
            <p className="text-sm text-[#d3d0d0] font-semibold uppercase tracking-[0.06em] mb-1">
              {label}
            </p>
            <p className="text-sm text-[#737373] font-mono break-all m-0">
              {(fb[key] as string) || "Not provided"}
            </p>
          </div>
        ))}
      </div>

      {/* Status picker */}
      <div>
        <p className="text-sm text-[#737373] font-medium uppercase tracking-[0.04em] mb-2">
          Update Status
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {(
            [
              "unreviewed",
              "in_review",
              "accepted",
              "in_progress",
              "resolved",
              "not_feasible",
              "closed",
              "spam",
            ] as Status[]
          ).map((s) => {
            const isActive = fb.status === s || (s === "in_review" && fb.status === "reviewed");
            return (
              <button
                key={s}
                onClick={() => onUpdateStatus(fb.id, s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer capitalize transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <StatusBadge status={s} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Delete */}
      <div className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={() => onDelete(fb.id)} className="gap-1.5">
          <Trash2 size={14} />
          Delete
        </Button>
      </div>
    </div>
  );
}
