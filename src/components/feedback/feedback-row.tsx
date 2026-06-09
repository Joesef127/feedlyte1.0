"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, CheckCheck, Check, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Feedback, Status } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface FeedbackRowProps {
  fb: Feedback;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
  projectName?: string;
  projectColor?: string;
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

  const handleOpen = () => {
    if (fb.status === "unreviewed") onUpdateStatus(fb.id, "reviewed");
    router.push(`/dashboard/feedback/${fb.id}`);
  };

  return (
    <div onClick={handleOpen} className="bg-card border border-border rounded-[10px] px-4 py-3.5 flex items-start gap-3.5 hover:border-border/70 transition-colors cursor-pointer">
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
            <span className="text-xs xl:text-sm text-muted-foreground">{fb.email}</span>
          )}
          <span className="text-xs xl:text-sm text-muted-foreground/40">
            {timeAgo(fb.createdAt)}
          </span>
        </div>
      </div>

      {/* Right: status badge + options */}
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {/* <StatusBadge status={fb.status} /> */}

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
                  onClick={() => {
                    setMenuOpen(false);
                    onUpdateStatus(fb.id, "reviewed");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <Check size={13} />
                  Mark as reviewed
                </button>
              )}
              {fb.status !== "resolved" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onUpdateStatus(fb.id, "resolved");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <CheckCheck size={13} />
                  Mark as resolved
                </button>
              )}
              {fb.status !== "unreviewed" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onUpdateStatus(fb.id, "unreviewed");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-left"
                >
                  <Eye size={13} />
                  Mark as unreviewed
                </button>
              )}
              <div className="h-px bg-border mx-2 my-1" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(fb.id);
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
