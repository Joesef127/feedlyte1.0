"use client";

import { useState } from "react";
import { X, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface BulkActionBarProps {
  count: number;
  projectCount: number;
  projectNames: string[];
  onBulkUnreviewed: () => void;
  onBulkReviewed: () => void;
  onBulkResolved: () => void;
  onBulkDelete: () => Promise<void>;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
