"use client";

import { useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import type { Feedback, Status } from "@/types";
import { Modal } from "@/components/ui/modal";
import { FeedbackRow } from "./feedback-row";
import { FeedbackDetail } from "./feedback-detail";

interface FeedbackTableProps {
  feedback: Feedback[];
  isLoading?: boolean;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

const STATUS_FILTERS: { id: "all" | Status; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "reviewed", label: "Reviewed" },
  { id: "resolved", label: "Resolved" },
];

export function FeedbackTable({ feedback, isLoading, onUpdateStatus, onDelete }: FeedbackTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Feedback | null>(null);

  const filtered = feedback.filter((f) => {
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      f.message.toLowerCase().includes(q) ||
      (f.email && f.email.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = (id: string, status: Status) => {
    onUpdateStatus(id, status);
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setSelected(null);
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex gap-2.5 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={14} className="text-muted-foreground" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback..."
            className="w-full bg-card border border-border rounded-lg py-2 pl-[34px] pr-3 text-sm text-foreground placeholder:text-[#d3d0d0] outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setStatusFilter(id)}
              className="px-3 py-[7px] rounded-[7px] border text-sm font-medium cursor-pointer capitalize transition-all"
              style={{
                borderColor: statusFilter === id ? "#F59E0B" : "#2A2A2A",
                background: statusFilter === id ? "#F59E0B10" : "transparent",
                color: statusFilter === id ? "#F59E0B" : "#525252",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-base">
          Loading feedback...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="text-[#2a2a2a] mx-auto" />
          <p className="text-[#d3d0d0] text-base mt-3">
            No feedback matches your filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((fb) => (
            <FeedbackRow key={fb.id} fb={fb} onSelect={() => setSelected(fb)} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Feedback Detail"
        width={520}
      >
        {selected && (
          <FeedbackDetail
            fb={selected}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        )}
      </Modal>
    </div>
  );
}
