"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface FeedbackDeleteModalsProps {
  deleteFeedbackOpen: boolean;
  onDeleteFeedbackClose: () => void;
  onConfirmDeleteFeedback: () => Promise<void> | void;
  isDeletingFeedback?: boolean;
  noteToDelete: string | null;
  onDeleteNoteClose: () => void;
  onConfirmDeleteNote: (noteId: string) => Promise<void> | void;
  isDeletingNote?: boolean;
}

export function FeedbackDeleteModals({
  deleteFeedbackOpen,
  onDeleteFeedbackClose,
  onConfirmDeleteFeedback,
  isDeletingFeedback = false,
  noteToDelete,
  onDeleteNoteClose,
  onConfirmDeleteNote,
  isDeletingNote = false,
}: FeedbackDeleteModalsProps) {
  return (
    <>
      {/* Delete feedback modal */}
      <Modal
        open={deleteFeedbackOpen}
        onClose={onDeleteFeedbackClose}
        title="Delete Feedback"
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          This will permanently delete this feedback entry. This cannot be
          undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onDeleteFeedbackClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDeleteFeedback}
            disabled={isDeletingFeedback}
          >
            {isDeletingFeedback ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>

      {/* Delete note modal */}
      <Modal
        open={!!noteToDelete}
        onClose={onDeleteNoteClose}
        title="Delete Note"
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Are you sure you want to delete this internal note? This cannot be
          undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onDeleteNoteClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (noteToDelete) {
                await onConfirmDeleteNote(noteToDelete);
                onDeleteNoteClose();
              }
            }}
            disabled={isDeletingNote}
          >
            {isDeletingNote ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
