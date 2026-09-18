"use client";

import { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { timeAgo } from "./feedback-detail-utils";

interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

interface FeedbackNotesTimelineProps {
  notes: NoteItem[];
  notesLoading: boolean;
  onAddNote: (content: string) => Promise<void>;
  onDeleteNoteClick: (noteId: string) => void;
  isAddingNote?: boolean;
  isDeletingNote?: boolean;
}

export function FeedbackNotesTimeline({
  notes,
  notesLoading,
  onAddNote,
  onDeleteNoteClick,
  isAddingNote = false,
  isDeletingNote = false,
}: FeedbackNotesTimelineProps) {
  const [noteContent, setNoteContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteContent.trim();
    if (!trimmed) return;
    await onAddNote(trimmed);
    setNoteContent("");
  };

  return (
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
      <form onSubmit={handleSubmit} className="mb-4">
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
              disabled={!noteContent.trim() || isAddingNote}
              className="gap-1.5 h-8 text-xs font-semibold"
            >
              <Send size={12} />
              {isAddingNote ? "Posting..." : "Add Note"}
            </Button>
          </div>
        </div>
      </form>

      {/* Notes list */}
      {notesLoading ? (
        <div className="text-center py-4 text-xs text-muted-foreground">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="p-4 rounded-lg bg-muted/20 border border-border/40 text-center text-xs text-muted-foreground/70">
          No internal notes yet. Use notes to document triage steps, root causes,
          or team delegation.
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
                onClick={() => onDeleteNoteClick(n.id)}
                disabled={isDeletingNote}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 cursor-pointer"
                title="Delete note"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
