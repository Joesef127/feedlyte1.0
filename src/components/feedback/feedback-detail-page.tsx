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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useFeedbackItem,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from "@/hooks/use-feedback";
import type { Status } from "@/types";
import { toast } from "sonner";

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

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

export function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);

  const { data: feedback, isLoading, isError } = useFeedbackItem(id);
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFb = useDeleteFeedback();

  const handleDelete = async () => {
    try {  
      await deleteFb.mutateAsync(id);  
      toast.success("Feedback deleted");  
      router.push("/dashboard/feedback");  
    } catch (err) {  
      toast.error(  
        err instanceof Error ? err.message : "Failed to delete feedback",  
      );  
      console.error("Delete feedback error:", err);
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

  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors bg-transparent border-none cursor-pointer p-0"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="max-w-full xl:max-w-3/4 flex flex-col gap-4">
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

          <div className="bg-background border border-border rounded-xl px-3 sm:px-5 py-4">
            <p className="text-sm sm:text-base text-foreground leading-relaxed m-0 whitespace-pre-wrap">
              {feedback.message}
            </p>
          </div>
        </Card>

        {/* Status management */}
        <Card>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Status
          </h3>
          <div className="flex gap-2 flex-wrap">
            {(["unreviewed", "reviewed", "resolved"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  updateStatus.mutate(
                    { id: feedback.id, status: s },
                    {
                      onSuccess: () => {
                        toast.success(`Marked as ${s}`);
                      },
                      onError: (err) => {
                        toast.error(err instanceof Error ? err.message : "Failed to update status");
                      },
                    }
                  );
                }}                disabled={feedback.status === s || updateStatus.isPending}
                className={[
                  "px-4 py-2 rounded-lg border text-xs sm:text-sm font-semibold cursor-pointer transition-all capitalize",
                  feedback.status === s
                    ? "border-primary bg-primary/10 text-primary cursor-default"
                    : "border-border bg-transparent text-muted-foreground hover:border-border/80 hover:text-foreground disabled:opacity-50",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        {/* Metadata */}
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

            {feedback.userAgent && (
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border sm:col-span-2">
                <Clock
                  size={15}
                  className="text-muted-foreground/60 mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-0.5">
                    User Agent
                  </p>
                  <p className="text-sm text-muted-foreground font-mono break-all leading-relaxed">
                    {feedback.userAgent}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Similar feedback */}
        {feedback.similar.length > 0 && (
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
