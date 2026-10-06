"use client";

import Link from "next/link";
import { Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Status } from "@/types";
import { CATEGORY_ICONS, timeAgo } from "./feedback-detail-utils";

interface FeedbackDetailHeaderProps {
  project: {
    id: string;
    name: string;
    color: string;
  };
  status: Status;
  createdAt: string;
  category?: string | null;
  rating?: number | null;
  message: string;
  onDeleteClick: () => void;
}

export function FeedbackDetailHeader({
  project,
  status,
  createdAt,
  category,
  rating,
  message,
  onDeleteClick,
}: FeedbackDetailHeaderProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
            style={{ background: project.color }}
          />
          <div>
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="text-sm lg:text-base font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              {project.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={status} />
              <span className="text-sm text-muted-foreground/50">
                {timeAgo(createdAt)}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteClick}
          className="gap-1.5 shrink-0"
        >
          <Trash2 size={13} />
          Delete
        </Button>
      </div>

      {/* Category & Rating badges (if provided) */}
      {(category || (typeof rating === "number" && rating > 0)) && (
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {category && CATEGORY_ICONS[category] && (() => {
            const CategoryIcon = CATEGORY_ICONS[category];
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 text-foreground border border-border capitalize">
                <CategoryIcon size={14} className="text-primary" />
                {category}
              </span>
            );
          })()}

          {typeof rating === "number" && rating > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={
                      i < rating!
                        ? "text-amber-500"
                        : "text-muted-foreground/30"
                    }
                    fill={i < rating! ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="ml-1 text-xs font-medium text-foreground/80">
                ({rating}/5)
              </span>
            </div>
          )}
        </div>
      )}

      <div className="bg-background border border-border rounded-xl px-3 sm:px-5 py-4">
        <p className="text-sm sm:text-base text-foreground leading-relaxed m-0 whitespace-pre-wrap break-words">
          {message}
        </p>
      </div>
    </Card>
  );
}
