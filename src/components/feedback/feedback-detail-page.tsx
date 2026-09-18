"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useFeedbackItem,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
  useFeedbackNotes,
  useAddFeedbackNote,
  useDeleteFeedbackNote,
  useUpdateFeedbackDetails,
} from "@/hooks/use-feedback";
import type { Status } from "@/types";
import { friendlyError } from "@/lib/error-messages";
import { toast } from "sonner";
import {
  parseUserAgent,
  formatDuration,
  getOpenDuration,
} from "./detail/feedback-detail-utils";
import { FeedbackDetailHeader } from "./detail/feedback-detail-header";
import { FeedbackStatusSelector } from "./detail/feedback-status-selector";
import { FeedbackResolutionMetrics } from "./detail/feedback-resolution-metrics";
import { FeedbackTagsAssignment } from "./detail/feedback-tags-assignment";
import { FeedbackNotesTimeline } from "./detail/feedback-notes-timeline";
import { FeedbackSubmissionDetails } from "./detail/feedback-submission-details";
import { FeedbackSimilarAndProject } from "./detail/feedback-similar-and-project";
import { FeedbackDeleteModals } from "./detail/feedback-delete-modals";

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

export function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const { data: feedback, isLoading, isError } = useFeedbackItem(id);
  const { data: notes = [], isLoading: notesLoading } = useFeedbackNotes(id);
  const updateStatus = useUpdateFeedbackStatus();
  const updateDetails = useUpdateFeedbackDetails();
  const deleteFb = useDeleteFeedback();
  const addNote = useAddFeedbackNote(id);
  const deleteNote = useDeleteFeedbackNote(id);

  const handleDelete = async () => {
    try {
      await deleteFb.mutateAsync(id);
      toast.success("Feedback deleted");
      router.push("/dashboard/feedback");
    } catch (err) {
      toast.error(friendlyError(err));
      console.error("Delete feedback error:", err);
    }
  };

  const handleStatusSelect = async (newStatus: Status) => {
    if (!feedback) return;
    try {
      await updateStatus.mutateAsync({ id: feedback.id, status: newStatus });
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleAddTag = async (tag: string) => {
    if (!feedback) return;
    const currentTags = feedback.tags ?? [];
    if (currentTags.includes(tag)) return;
    const nextTags = [...currentTags, tag];
    try {
      await updateDetails.mutateAsync({
        id: feedback.id,
        details: { tags: nextTags },
      });
      toast.success(`Tag #${tag} added`);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!feedback) return;
    const nextTags = (feedback.tags ?? []).filter((t) => t !== tagToRemove);
    try {
      await updateDetails.mutateAsync({
        id: feedback.id,
        details: { tags: nextTags },
      });
      toast.success(`Tag #${tagToRemove} removed`);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleUnassign = async () => {
    if (!feedback) return;
    try {
      await updateDetails.mutateAsync({
        id: feedback.id,
        details: { assignedToId: null },
      });
      toast.success("Unassigned");
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleAddNote = async (content: string) => {
    try {
      await addNote.mutateAsync(content);
      toast.success("Internal note added");
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success("Note deleted");
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !feedback) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3">
        <p className="text-muted-foreground text-sm">Feedback not found.</p>
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/feedback")}
        >
          Back to Feedback
        </Button>
      </div>
    );
  }

  const { browser, os } = parseUserAgent(feedback.userAgent);

  const createdAtMs = new Date(feedback.createdAt).getTime();
  const resolutionDuration = feedback.resolvedAt
    ? formatDuration(new Date(feedback.resolvedAt).getTime() - createdAtMs)
    : null;
  const firstResponseDuration = feedback.firstRespondedAt
    ? formatDuration(new Date(feedback.firstRespondedAt).getTime() - createdAtMs)
    : null;
  const openDuration = getOpenDuration(feedback.createdAt);

  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        <ArrowLeft size={14} />
        Back to Feedback
      </button>

      <div className="max-w-full xl:max-w-3/4 flex flex-col gap-5">
        <FeedbackDetailHeader
          project={feedback.project}
          status={feedback.status}
          createdAt={feedback.createdAt}
          category={feedback.category}
          rating={feedback.rating}
          message={feedback.message}
          onDeleteClick={() => setDeleteModal(true)}
        />

        <FeedbackStatusSelector
          currentStatus={feedback.status}
          onStatusSelect={handleStatusSelect}
          isPending={updateStatus.isPending}
        />

        <FeedbackResolutionMetrics
          resolutionDuration={resolutionDuration}
          openDuration={openDuration}
          firstResponseDuration={firstResponseDuration}
        />

        <FeedbackTagsAssignment
          tags={feedback.tags ?? []}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          assignedTo={feedback.assignedTo}
          onUnassign={handleUnassign}
        />

        <FeedbackNotesTimeline
          notes={notes}
          notesLoading={notesLoading}
          onAddNote={handleAddNote}
          onDeleteNoteClick={(noteId) => setNoteToDelete(noteId)}
          isAddingNote={addNote.isPending}
          isDeletingNote={deleteNote.isPending}
        />

        <FeedbackSubmissionDetails
          createdAt={feedback.createdAt}
          email={feedback.email}
          pageUrl={feedback.pageUrl}
          browser={browser}
          os={os}
          technicalDetails={feedback.technicalDetails}
        />

        <FeedbackSimilarAndProject
          similar={feedback.similar}
          project={feedback.project}
        />
      </div>

      <FeedbackDeleteModals
        deleteFeedbackOpen={deleteModal}
        onDeleteFeedbackClose={() => setDeleteModal(false)}
        onConfirmDeleteFeedback={handleDelete}
        isDeletingFeedback={deleteFb.isPending}
        noteToDelete={noteToDelete}
        onDeleteNoteClose={() => setNoteToDelete(null)}
        onConfirmDeleteNote={handleDeleteNote}
        isDeletingNote={deleteNote.isPending}
      />
    </div>
  );
}
