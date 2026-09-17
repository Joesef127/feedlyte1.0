"use client";

import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Check,
  Trash2,
  Square,
  CheckSquare,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Star,
  Sliders,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Feedback, Status } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { friendlyError } from "@/lib/error-messages";
import { toast } from "sonner";

interface FeedbackRowProps {
  fb: Feedback;
  onUpdateStatus: (id: string, status: Status) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  projectName?: string;
  projectColor?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  clearSelection?: () => void;
}

const CATEGORY_ICONS: Record<string, typeof Bug> = {
  bug: Bug,
  idea: Lightbulb,
  praise: Heart,
  question: HelpCircle,
};

const ALL_STATUS_ACTIONS: { status: Status; label: string }[] = [
  { status: "unreviewed", label: "Unreviewed" },
  { status: "in_review", label: "In Review" },
  { status: "accepted", label: "Accepted" },
  { status: "in_progress", label: "In Progress" },
  { status: "resolved", label: "Resolved" },
  { status: "not_feasible", label: "Not Feasible" },
  { status: "closed", label: "Closed" },
  { status: "spam", label: "Spam" },
];

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

export function FeedbackRow({
  fb,
  onUpdateStatus,
  onDelete,
  projectName,
  projectColor,
  selected = false,
  onSelect,
  clearSelection,
}: FeedbackRowProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!menuOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < 260 && spaceAbove > spaceBelow) {
      setMenuPosition("top");
    } else {
      setMenuPosition("bottom");
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = () => {
      clearSelection?.(); // or setShowModal(false), etc.
    };
    window.addEventListener("feedlyte:escape", handleEscape);
    return () => window.removeEventListener("feedlyte:escape", handleEscape);
  }, [clearSelection]);

  const handleOpen = () => {
    if (fb.status === "unreviewed") onUpdateStatus(fb.id, "in_review");
    router.push(`/dashboard/feedback/${fb.id}`);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(fb.id);
  };

  return (
    <div
      onClick={handleOpen}
      className={[
        "bg-card border border-border rounded-[10px] px-4 py-3.5 flex items-start gap-3.5 hover:border-border/70 transition-colors cursor-pointer",
        selected && "ring-2 ring-primary border-primary",
      ].join(" ")}
    >
      {/* Checkbox */}
      <div
        onClick={handleCheckboxClick}
        className="flex items-center justify-center w-5 h-5 rounded border border-border bg-background shrink-0 mt-0.5 hover:bg-accent transition-colors"
        aria-label={selected ? "Deselect" : "Select"}
        aria-checked={selected}
        role="checkbox"
      >
        {selected ? (
          <CheckSquare size={14} className="text-primary" />
        ) : (
          <Square size={14} className="text-muted-foreground" />
        )}
      </div>
      {/* Main content — clickable */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-1.5 mb-2">
          <p className="text-sm text-foreground font-medium leading-relaxed line-clamp-2 truncate max-w-4/5">
            {fb.message}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            {fb.category && CATEGORY_ICONS[fb.category] && (() => {
              const CategoryIcon = CATEGORY_ICONS[fb.category];
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/50 capitalize">
                  <CategoryIcon size={12} className="text-foreground/70" />
                  {fb.category}
                </span>
              );
            })()}
            {typeof fb.rating === "number" && fb.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Star size={11} fill="currentColor" />
                {fb.rating}
              </span>
            )}
            <StatusBadge status={fb.status} />
          </div>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          {projectColor && projectName && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: projectColor }}
              />
              <span className="text-xs xl:text-sm text-muted-foreground/60">
                {projectName}
              </span>
            </div>
          )}
          {fb.tags && fb.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {fb.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          {fb.assignedTo && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {fb.assignedTo.name || fb.assignedTo.email}
            </span>
          )}
          {Boolean(fb.notesCount && fb.notesCount > 0) && (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70 bg-muted/40 px-1.5 py-0.5 rounded border border-border/50"
              title={`${fb.notesCount} internal note(s)`}
            >
              {fb.notesCount} note{fb.notesCount !== 1 ? "s" : ""}
            </span>
          )}
          {fb.pageUrl && (
            <span className="text-xs xl:text-sm text-muted-foreground/50 font-mono truncate">
              {fb.pageUrl}
            </span>
          )}
          {fb.email && (
            <span className="text-xs xl:text-sm text-muted-foreground">
              {fb.email}
            </span>
          )}
          {fb.technicalDetails && Object.keys(fb.technicalDetails).length > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70 bg-muted/40 border border-border/50 px-1.5 py-0.5 rounded"
              title={`${Object.keys(fb.technicalDetails).length} technical detail(s) captured`}
            >
              <Sliders size={11} className="text-muted-foreground" />
              Tech details
            </span>
          )}
          <span className="text-xs xl:text-sm text-muted-foreground/40">
            {timeAgo(fb.createdAt)}
          </span>
        </div>
      </div>

      {/* Right: options menu */}
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer border-none bg-transparent"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div
              className={`absolute right-0 ${
                menuPosition === "top" ? "bottom-full mb-1" : "top-full mt-1"
              } z-50 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 max-h-80 overflow-y-auto`}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleOpen();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
              >
                <Eye size={13} />
                View details
              </button>

              <div className="h-px bg-border mx-2 my-1" />
              <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Change Status
              </div>

              {ALL_STATUS_ACTIONS.map(({ status, label }) => {
                const isCurrent =
                  fb.status === status ||
                  (status === "in_review" && fb.status === "reviewed");
                return (
                  <button
                    key={status}
                    disabled={isCurrent}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      try {
                        await onUpdateStatus(fb.id, status);
                        toast.success(`Marked as ${label.toLowerCase()}`);
                      } catch (error) {
                        toast.error(friendlyError(error));
                        console.error(error);
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{label}</span>
                    {isCurrent && (
                      <Check size={12} className="text-primary shrink-0" />
                    )}
                  </button>
                );
              })}

              <div className="h-px bg-border mx-2 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setDeleteModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer text-left"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div onClick={(e) => e.stopPropagation()}>
        <Modal
          open={deleteModalOpen}
          onClose={() => !isDeleting && setDeleteModalOpen(false)}
          title="Delete Feedback"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground m-0">
              Are you sure you want to delete this feedback item? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button
                variant="secondary"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={async (e) => {
                  e.stopPropagation();
                  setIsDeleting(true);
                  try {
                    await onDelete(fb.id);
                    toast.success("Feedback deleted");
                    setDeleteModalOpen(false);
                  } catch (error) {
                    toast.error(friendlyError(error));
                    console.error(error);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
