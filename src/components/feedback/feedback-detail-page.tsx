"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Globe,
  Mail,
  Monitor,
  Calendar,
  Tag,
  ExternalLink,
  Clock,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Star,
  Sliders,
  MessageSquare,
  Send,
  Timer,
  CheckCircle2,
  Plus,
  X,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
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

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  idea: Lightbulb,
  praise: Heart,
  question: HelpCircle,
};

const ALL_STATUSES: { id: Status; label: string }[] = [
  { id: "unreviewed", label: "Unreviewed" },
  { id: "in_review", label: "In Review" },
  { id: "accepted", label: "Accepted" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
  { id: "not_feasible", label: "Not Feasible" },
  { id: "closed", label: "Closed" },
  { id: "spam", label: "Spam" },
];

const REDUNDANT_TECH_KEYS = new Set([
  "browser & os",
  "browser",
  "os",
  "operating system",
  "user agent",
  "useragent",
  "timestamp",
  "date",
  "time",
  "current url",
  "page url",
  "url",
  "pageurl",
  "currenturl",
]);

function parseUserAgent(ua: string): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };

  const browser = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("Chrome/")
      ? "Chrome"
      : ua.includes("Firefox/")
        ? "Firefox"
        : ua.includes("Safari/")
          ? "Safari"
          : ua.includes("OPR/")
            ? "Opera"
            : "Unknown";

  const os = ua.includes("Windows NT")
    ? "Windows"
    : ua.includes("Mac OS X")
      ? "macOS"
      : ua.includes("Android")
        ? "Android"
        : ua.includes("iPhone")
          ? "iOS"
          : ua.includes("iPad")
            ? "iPadOS"
            : ua.includes("Linux")
              ? "Linux"
              : "Unknown";

  return { browser, os };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function formatDuration(ms: number): string {
  if (ms < 0) return "Instant";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days}d ${remHours > 0 ? `${remHours}h` : ""}`;
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return `${hours}h ${remMins > 0 ? `${remMins}m` : ""}`;
  }
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

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

  const handleAddTag = async () => {
    const tag = newTagInput.trim();
    if (!tag || !feedback) return;
    const currentTags = feedback.tags ?? [];
    if (currentTags.includes(tag)) {
      setNewTagInput("");
      setIsAddingTag(false);
      return;
    }
    const nextTags = [...currentTags, tag];
    try {
      await updateDetails.mutateAsync({
        id: feedback.id,
        details: { tags: nextTags },
      });
      setNewTagInput("");
      setIsAddingTag(false);
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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      await addNote.mutateAsync(noteContent.trim());
      setNoteContent("");
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
  const openDuration = formatDuration(Date.now() - createdAtMs);

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
        {/* Header card */}
        <Card>
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                style={{ background: feedback.project.color }}
              />
              <div>
                <Link
                  href={`/dashboard/projects/${feedback.project.id}`}
                  className="text-sm lg:text-base font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                >
                  {feedback.project.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={feedback.status} />
                  <span className="text-sm text-muted-foreground/50">
                    {timeAgo(feedback.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModal(true)}
              className="gap-1.5 shrink-0"
            >
              <Trash2 size={13} />
              Delete
            </Button>
          </div>

          {/* Category & Rating badges (if provided) */}
          {(feedback.category || (typeof feedback.rating === "number" && feedback.rating > 0)) && (
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {feedback.category && CATEGORY_ICONS[feedback.category] && (() => {
                const CategoryIcon = CATEGORY_ICONS[feedback.category];
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 text-foreground border border-border capitalize">
                    <CategoryIcon size={14} className="text-primary" />
                    {feedback.category}
                  </span>
                );
              })()}

              {typeof feedback.rating === "number" && feedback.rating > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < feedback.rating! ? "text-amber-500" : "text-muted-foreground/30"}
                        fill={i < feedback.rating! ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-xs font-medium text-foreground/80">
                    ({feedback.rating}/5)
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="bg-background border border-border rounded-xl px-3 sm:px-5 py-4">
            <p className="text-sm sm:text-base text-foreground leading-relaxed m-0 whitespace-pre-wrap">
              {feedback.message}
            </p>
          </div>
        </Card>

        {/* Triage & Workflow Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status management */}
          <Card>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Update Status
              </h3>
              <span className="text-xs text-muted-foreground/60">
                Current: <span className="font-semibold text-foreground capitalize">{feedback.status.replace("_", " ")}</span>
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {ALL_STATUSES.map((s) => {
                const isActive = feedback.status === s.id || (s.id === "in_review" && feedback.status === "reviewed");
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      updateStatus.mutate(
                        { id: feedback.id, status: s.id },
                        {
                          onSuccess: () => {
                            toast.success(`Marked as ${s.label}`);
                          },
                          onError: (err) => {
                            toast.error(friendlyError(err));
                          },
                        },
                      );
                    }}
                    disabled={isActive || updateStatus.isPending}
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

          {/* Response & Resolution Metrics */}
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
        </div>

        {/* Tags & Assignment Card */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={13} className="text-primary" />
                  Tags
                </h3>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {feedback.tags && feedback.tags.length > 0 ? (
                  feedback.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      #{t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-destructive transition-colors p-0.5"
                        title="Remove tag"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground/60">No tags assigned</span>
                )}

                {isAddingTag ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                        if (e.key === "Escape") setIsAddingTag(false);
                      }}
                      placeholder="tag-name"
                      autoFocus
                      className="h-7 w-28 px-2 text-xs bg-background border border-primary rounded-md outline-none"
                    />
                    <button
                      onClick={handleAddTag}
                      className="h-7 px-2 text-xs bg-primary text-primary-foreground rounded-md font-semibold"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingTag(false)}
                      className="h-7 px-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors cursor-pointer"
                  >
                    <Plus size={11} />
                    Add Tag
                  </button>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <UserCheck size={13} className="text-primary" />
                Assignee
              </h3>
              <div className="flex items-center gap-2">
                {feedback.assignedTo ? (
                  <div className="flex items-center justify-between p-2 bg-background border border-border rounded-lg flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                        {(feedback.assignedTo.name || feedback.assignedTo.email)[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {feedback.assignedTo.name || feedback.assignedTo.email}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await updateDetails.mutateAsync({
                          id: feedback.id,
                          details: { assignedToId: null },
                        });
                        toast.success("Unassigned");
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Unassign"
                    >
                      Unassign
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/60 py-2">
                    Unassigned
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Internal Team Notes Timeline */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={13} className="text-primary" />
                Internal Team Notes ({notes.length})
              </h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Notes are private to your workspace and never exposed to the visitor.
              </p>
            </div>
          </div>

          {/* New note input form */}
          <form onSubmit={handleAddNote} className="mb-4">
            <div className="relative">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Leave an internal note or action plan..."
                rows={2}
                className="w-full bg-background border border-border rounded-xl p-3 pr-20 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors resize-none"
              />
              <div className="absolute right-2.5 bottom-2.5">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!noteContent.trim() || addNote.isPending}
                  className="gap-1.5 h-8 text-xs font-semibold"
                >
                  <Send size={12} />
                  {addNote.isPending ? "Posting..." : "Add Note"}
                </Button>
              </div>
            </div>
          </form>

          {/* Notes list */}
          {notesLoading ? (
            <div className="text-center py-4 text-xs text-muted-foreground">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="p-4 rounded-lg bg-muted/20 border border-border/40 text-center text-xs text-muted-foreground/70">
              No internal notes yet. Use notes to document triage steps, root causes, or team delegation.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3 bg-background rounded-lg border border-border flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-muted text-foreground flex items-center justify-center text-xs font-bold uppercase shrink-0 mt-0.5">
                      {(n.user?.name || n.user?.email || "U")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {n.user?.name || n.user?.email || "Team Member"}
                        </span>
                        <span className="text-[11px] text-muted-foreground/50">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap leading-relaxed">
                        {n.content}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(n.id)}
                    disabled={deleteNote.isPending}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                    title="Delete note"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Submission Details */}
        <Card>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Submission Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <Calendar
                size={15}
                className="text-muted-foreground/60 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                  Submitted
                </p>
                <p className="text-sm text-foreground font-medium">
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <Mail
                size={15}
                className="text-muted-foreground/60 mt-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                  Email
                </p>
                {feedback.email ? (
                  <a
                    href={`mailto:${feedback.email}`}
                    className="text-sm text-primary hover:text-primary/80 transition-colors break-all"
                  >
                    {feedback.email}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground/50">
                    Not provided
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border sm:col-span-2">
              <Globe
                size={15}
                className="text-muted-foreground/60 mt-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                  Page URL
                </p>
                {feedback.pageUrl ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground font-mono break-all flex-1">
                      {feedback.pageUrl}
                    </p>
                    <a
                      href={feedback.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50">
                    Not captured
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <Monitor
                size={15}
                className="text-muted-foreground/60 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                  Browser
                </p>
                <p className="text-sm text-foreground font-medium">{browser}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <Tag
                size={15}
                className="text-muted-foreground/60 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                  Operating System
                </p>
                <p className="text-sm text-foreground font-medium">{os}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical details (filtered of redundant fields) */}
        {(() => {
          const nonRedundantTech = feedback.technicalDetails
            ? Object.entries(feedback.technicalDetails).filter(
                ([key]) => !REDUNDANT_TECH_KEYS.has(key.toLowerCase().trim()),
              )
            : [];
          if (nonRedundantTech.length === 0) return null;
          return (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-primary" />
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Technical Details
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground/60 font-medium">
                  Captured with visitor consent
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nonRedundantTech.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 p-3 bg-background rounded-lg border border-border"
                  >
                    <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold">
                      {label}
                    </p>
                    <p className="text-xs sm:text-sm text-foreground font-mono break-all leading-relaxed select-all">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })()}

        {/* Similar feedback */}
        {feedback.similar && feedback.similar.length > 0 && (
          <Card>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Other Feedback from This Page
            </h3>
            <div className="flex flex-col gap-2">
              {feedback.similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/feedback/${s.id}`}
                  className="flex items-center justify-between gap-3 p-3 bg-background border border-border rounded-lg hover:border-border/80 transition-colors group"
                >
                  <p className="text-sm text-foreground truncate flex-1 group-hover:text-primary transition-colors">
                    {s.message}
                  </p>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <StatusBadge status={s.status} />
                    <span className="text-sm text-muted-foreground/50">
                      {timeAgo(s.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Project context */}
        <Card>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Project
          </h3>
          <Link
            href={`/dashboard/projects/${feedback.project.id}`}
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-border/80 transition-colors group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: feedback.project.color,
                opacity: 0.125,
              }}
            >
              <Globe size={15} style={{ color: feedback.project.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {feedback.project.name}
              </p>
              <p className="text-sm text-muted-foreground font-mono truncate">
                {feedback.project.id}
              </p>
            </div>
            <ExternalLink
              size={14}
              className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
            />
          </Link>
        </Card>
      </div>

      {/* Delete modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Feedback"
      >
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          This will permanently delete this feedback entry. This cannot be
          undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteFb.isPending}
          >
            {deleteFb.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
