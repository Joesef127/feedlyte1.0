"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check, CheckCheck, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import type { Status } from "@/types";

interface BulkActionBarProps {
  count: number;
  projectCount: number;
  projectNames: string[];
  onBulkUnreviewed: () => void;
  onBulkReviewed: () => void;
  onBulkResolved: () => void;
  onBulkStatusChange?: (status: Status) => void;
  onBulkDelete: () => Promise<void>;
  onClear: () => void;
  isPending: boolean;
}

const EXTRA_STATUSES: { status: Status; label: string }[] = [
  { status: "accepted", label: "Mark Accepted" },
  { status: "in_progress", label: "Mark In Progress" },
  { status: "not_feasible", label: "Mark Not Feasible" },
  { status: "closed", label: "Mark Closed" },
  { status: "spam", label: "Mark Spam" },
];

export function BulkActionBar({
  count,
  projectCount,
  projectNames,
  onBulkUnreviewed,
  onBulkReviewed,
  onBulkResolved,
  onBulkStatusChange,
  onBulkDelete,
  onClear,
  isPending,
}: BulkActionBarProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isMultiProject = projectCount > 1;

  const projectText = isMultiProject
    ? `across ${projectCount} projects (${projectNames.join(", ")})`
    : projectNames[0]
      ? `in ${projectNames[0]}`
      : "";

  const deleteText = isMultiProject
    ? `Delete ${count} items ${projectText}?`
    : `Delete ${count} item${count !== 1 ? "s" : ""}?`;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await onBulkDelete();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete feedback"
      );
      console.error("Bulk delete error:", err);
    } finally {
      setShowDeleteModal(false);
    }
  };
  
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      style={{ maxWidth: "calc(100vw - 32px)" }}
    >
      <div className="bg-card border border-border rounded-xl shadow-xl p-3 flex flex-col items-start justify-between gap-3 w-full min-w-75">
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

        <div className="grid grid-cols-2 sm:flex flex-wrap items-center gap-2 shrink-0 sm:w-max">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkUnreviewed}
            disabled={isPending}
            className="gap-1.5 text-xs"
          >
            <Check size={13} />
            Mark Unreviewed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkReviewed}
            disabled={isPending}
            className="gap-1.5 text-xs"
          >
            <Check size={13} />
            Mark Reviewed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkResolved}
            disabled={isPending}
            className="gap-1.5 text-xs"
          >
            <CheckCheck size={13} />
            Mark Resolved
          </Button>
          <div ref={moreMenuRef} className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMoreMenuOpen((o) => !o)}
              disabled={isPending}
              className="gap-1.5 text-xs"
            >
              More Statuses
              <ChevronDown
                size={13}
                className={moreMenuOpen ? "rotate-180 transition-transform" : "transition-transform"}
              />
            </Button>
            {moreMenuOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto bottom-full mb-2 z-50 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1">
                {EXTRA_STATUSES.map(({ status, label }) => (
                  <button
                    key={status}
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setMoreMenuOpen(false);
                      onBulkStatusChange?.(status);
                    }}
                    className="w-full flex items-center px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isPending}
            className="gap-1.5 text-xs"
          >
            <Trash2 size={13} />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Feedback"
        description={deleteText}
      >
        <p className="text-sm text-muted-foreground mb-6">
          This action cannot be undone. The selected feedback will be
          permanently removed.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
