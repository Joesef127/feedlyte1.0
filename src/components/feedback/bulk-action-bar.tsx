"use client";

import { X, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  count: number;
  projectCount: number;
  projectNames: string[];
  onBulkUnreviewed: () => void;
  onBulkReviewed: () => void;
  onBulkResolved: () => void;
  onBulkDelete: () => void;
  onClear: () => void;
  isPending: boolean;
}

export function BulkActionBar({
  count,
  projectCount,
  projectNames,
  onBulkUnreviewed,
  onBulkReviewed,
  onBulkResolved,
  onBulkDelete,
  onClear,
  isPending,
}: BulkActionBarProps) {
  const isMultiProject = projectCount > 1;

  const projectText = isMultiProject
    ? `across ${projectCount} projects (${projectNames.join(", ")})`
    : projectNames[0]
      ? `in ${projectNames[0]}`
      : "";

  const deleteText = isMultiProject
    ? `Delete ${count} items ${projectText}?`
    : `Delete ${count} item${count !== 1 ? "s" : ""}?`;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      style={{ maxWidth: "calc(100vw - 32px)" }}
    >
      <div className="bg-card border border-border rounded-xl shadow-xl p-3 flex flex-col xl:flex-row items-center justify-between gap-3 w-full min-w-[300px]">
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Clear selection"
          >
            <X size={16} />
          </button>
          <div className="border-l border-border pl-3">
            <p className="text-sm font-medium text-foreground">
              {count} item{count !== 1 ? "s" : ""} selected
            </p>
            {projectText && (
              <p className="text-xs text-muted-foreground">{projectText}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkUnreviewed}
            disabled={isPending}
            className="gap-1.5"
          >
            <Check size={13} />
            Mark Unreviewed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkReviewed}
            disabled={isPending}
            className="gap-1.5"
          >
            <Check size={13} />
            Mark Reviewed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkResolved}
            disabled={isPending}
            className="gap-1.5"
          >
            <CheckCheck size={13} />
            Mark Resolved
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={isPending}
            className="gap-1.5"
          >
            <Trash2 size={13} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}