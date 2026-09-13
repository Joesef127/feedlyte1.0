"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Check, Trash2, Square, CheckSquare, Bug, Lightbulb, Heart, HelpCircle, Star, Sliders } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Feedback, Status } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

interface FeedbackCardProps {
  fb:             Feedback;
  onUpdateStatus: (id: string, status: Status) => Promise<void>;
  onDelete:       (id: string) => Promise<void>;
  projectName?:   string;
  projectColor?:  string;
  selected?:      boolean;
  onSelect?:      (id: string) => void;
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
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Just now";
}

export function FeedbackCard({
  fb,
  onUpdateStatus,
  onDelete,
  projectName,
  projectColor,
  selected = false,
  onSelect,
  clearSelection,
}: FeedbackCardProps) {
  const router         = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef        = useRef<HTMLDivElement>(null);

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
        "bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-border/70 transition-colors",
        selected && "ring-2 ring-primary border-primary",
      ].join(" ")}
    >
      {/* Top row: project info + status + menu + checkbox */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            onClick={handleCheckboxClick}
            className="flex items-center justify-center w-5 h-5 rounded border border-border bg-background shrink-0 hover:bg-accent transition-colors"
            aria-label={selected ? "Deselect" : "Select"}
            aria-checked={selected}
          >
            {selected ? (
              <CheckSquare size={14} className="text-primary" />
            ) : (
              <Square size={14} className="text-muted-foreground" />
            )}
          </div>

          <StatusBadge status={fb.status} />
          {fb.category && CATEGORY_ICONS[fb.category] && (() => {
            const CategoryIcon = CATEGORY_ICONS[fb.category];
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/50 capitalize shrink-0">
                <CategoryIcon size={12} className="text-foreground/70" />
                {fb.category}
              </span>
            );
          })()}
          {typeof fb.rating === "number" && fb.rating > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <Star size={11} fill="currentColor" />
              {fb.rating}
            </span>
          )}
          <div className="flex items-center gap-2 min-w-0">
            {projectColor && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: projectColor }}
              />
            )}
            {projectName && (
              <span className="text-xs text-muted-foreground/60 font-medium truncate">
                {projectName}
              </span>
            )}
          </div>
        </div>

        {/* Options menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer border-none bg-transparent"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 max-h-80 overflow-y-auto">
              <button
                onClick={() => { setMenuOpen(false); handleOpen(); }}
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
                        toast.error("Failed to update status");
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
                onClick={async (e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  try {
                    await onDelete(fb.id);
                    toast.success("Feedback Deleted");
                  } catch (error) {
                    toast.error("Failed to delete feedback");
                    console.error(error);
                  }
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

      {/* Message */}
      <p
        className="text-sm text-foreground leading-relaxed line-clamp-3 cursor-pointer hover:text-primary transition-colors"
      >
        {fb.message}
      </p>

      {/* Footer: page URL + time + tech details */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
        {fb.pageUrl ? (
          <span className="text-xs text-muted-foreground/50 font-mono truncate max-w-[60%]">
            {fb.pageUrl}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/30">No URL</span>
        )}
        <div className="flex items-center gap-1.5 shrink-0">
          {fb.technicalDetails && Object.keys(fb.technicalDetails).length > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70 bg-muted/40 border border-border/50 px-1.5 py-0.5 rounded"
              title={`${Object.keys(fb.technicalDetails).length} technical detail(s) captured`}
            >
              <Sliders size={11} className="text-muted-foreground" />
              Tech
            </span>
          )}
          <span className="text-xs text-muted-foreground/40">
            {timeAgo(fb.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}