"use client";

import { useState } from "react";
import { Tag, Plus, X, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeedbackTagsAssignmentProps {
  tags: string[];
  onAddTag: (tag: string) => Promise<void>;
  onRemoveTag: (tag: string) => Promise<void>;
  assignedTo?: {
    name?: string | null;
    email: string;
  } | null;
  onUnassign: () => Promise<void>;
}

export function FeedbackTagsAssignment({
  tags,
  onAddTag,
  onRemoveTag,
  assignedTo,
  onUnassign,
}: FeedbackTagsAssignmentProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleAdd = async () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    await onAddTag(trimmed);
    setNewTagInput("");
    setIsAddingTag(false);
  };

  return (
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
            {tags && tags.length > 0 ? (
              tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  #{t}
                  <button
                    onClick={() => onRemoveTag(t)}
                    className="hover:text-destructive transition-colors p-0.5 cursor-pointer"
                    title="Remove tag"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground/60">
                No tags assigned
              </span>
            )}

            {isAddingTag ? (
              <div className="inline-flex items-center gap-1">
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd();
                    }
                    if (e.key === "Escape") setIsAddingTag(false);
                  }}
                  placeholder="tag-name"
                  autoFocus
                  className="h-7 w-28 px-2 text-xs bg-background border border-primary rounded-md outline-none"
                />
                <button
                  onClick={handleAdd}
                  className="h-7 px-2 text-xs bg-primary text-primary-foreground rounded-md font-semibold cursor-pointer"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingTag(false)}
                  className="h-7 px-1 text-muted-foreground hover:text-foreground cursor-pointer"
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
            {assignedTo ? (
              <div className="flex items-center justify-between p-2 bg-background border border-border rounded-lg flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                    {(assignedTo.name || assignedTo.email)[0]}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {assignedTo.name || assignedTo.email}
                  </span>
                </div>
                <button
                  onClick={onUnassign}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
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
  );
}
