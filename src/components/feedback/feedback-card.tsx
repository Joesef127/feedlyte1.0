"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, CheckCheck, Check, Trash2, Square, CheckSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Feedback, Status } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface FeedbackCardProps {
  fb:             Feedback;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete:       (id: string) => void;
  projectName?:   string;
  projectColor?:  string;
  selected?:      boolean;
  onSelect?:      (id: string) => void;
  clearSelection?: () => void;
}

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
    if (fb.status === "unreviewed") onUpdateStatus(fb.id, "reviewed");
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
            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1">
              <button
                onClick={() => { setMenuOpen(false); handleOpen(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
              >
                <Eye size={13} />
                View details
              </button>
              {fb.status !== "reviewed" && (
                <button
                  onClick={() => { setMenuOpen(false); onUpdateStatus(fb.id, "reviewed"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <Check size={13} />
                  Mark as reviewed
                </button>
              )}
              {fb.status !== "resolved" && (
                <button
                  onClick={() => { setMenuOpen(false); onUpdateStatus(fb.id, "resolved"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <CheckCheck size={13} />
                  Mark as resolved
                </button>
              )}
              {fb.status !== "unreviewed" && (
                <button
                  onClick={() => { setMenuOpen(false); onUpdateStatus(fb.id, "unreviewed"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <Eye size={13} />
                  Mark as unreviewed
                </button>
              )}
              <div className="h-px bg-border mx-2 my-1" />
              <button
                onClick={() => { setMenuOpen(false); onDelete(fb.id); }}
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

      {/* Footer: page URL + time */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
        {fb.pageUrl ? (
          <span className="text-xs text-muted-foreground/50 font-mono truncate max-w-[70%]">
            {fb.pageUrl}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/30">No URL</span>
        )}
        <span className="text-xs text-muted-foreground/40 shrink-0">
          {timeAgo(fb.createdAt)}
        </span>
      </div>
    </div>
  );
}