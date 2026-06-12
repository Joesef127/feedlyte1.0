"use client";

import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  CheckCheck,
  Check,
  Trash2,
  Square,
  CheckSquare,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Feedback, Status } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

interface FeedbackRowProps {
  fb: Feedback;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
  projectName?: string;
  projectColor?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
  clearSelection?: () => void;
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

          <StatusBadge status={fb.status} />
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
            <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1">
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
              
              {fb.status !== "reviewed" && (
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    try {
                      await onUpdateStatus(fb.id, "reviewed");
                      toast.success("Marked as reviewed");
                    } catch (error) {
                      toast.error("Failed to update status");
                      console.error(error);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <Check size={13} />
                  Mark as reviewed
                </button>
              )}

              {fb.status !== "resolved" && (
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    try {
                      await onUpdateStatus(fb.id, "resolved");
                      toast.success("Marked as resolved");
                    } catch (error) {
                      toast.error("Failed to update status");
                      console.error(error);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <CheckCheck size={13} />
                  Mark as resolved
                </button>
              )}

              {fb.status !== "unreviewed" && (
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    try {
                      await onUpdateStatus(fb.id, "unreviewed");
                      toast.success("Marked as unreviewed");
                    } catch (error) {
                      toast.error("Failed to update status");
                      console.error(error);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <Eye size={13} />
                  Mark as unreviewed
                </button>
              )}

              <div className="h-px bg-border mx-2 my-1" />
              <button
                onClick={async () => {
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
    </div>
  );
}
