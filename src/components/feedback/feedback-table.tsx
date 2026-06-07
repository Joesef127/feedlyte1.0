"use client";

import { useState } from "react";
import { MessageSquare, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Feedback, Status } from "@/types";
import { FeedbackRow } from "./feedback-row";
import { EmptyState } from "@/components/ui/empty-state";

interface FeedbackTableProps {
  feedback:       Feedback[];
  isLoading?:     boolean;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete:       (id: string) => void;
}

const STATUS_FILTERS: { id: "all" | Status; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "new",      label: "New" },
  { id: "reviewed", label: "Reviewed" },
  { id: "resolved", label: "Resolved" },
];

const PAGE_SIZE = 10;

export function FeedbackTable({ feedback, isLoading }: FeedbackTableProps) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [page,         setPage]         = useState(1);

  const handleSearch = (v: string) => { setSearch(v);        setPage(1); };
  const handleFilter = (v: "all" | Status) => { setStatusFilter(v); setPage(1); };

  const filtered = feedback.filter((f) => {
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      f.message.toLowerCase().includes(q) ||
      (f.email   && f.email.toLowerCase().includes(q))   ||
      (f.pageUrl && f.pageUrl.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo   = Math.min(safePage * PAGE_SIZE, filtered.length);
  const hasFilters  = search || statusFilter !== "all";

  return (
    <div>
      {/* Controls */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-50">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={14} className="text-muted-foreground" />
          </div>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search feedback..."
            className="w-full bg-card border border-border rounded-lg py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleFilter(id)}
              className={[
                "px-3 py-2 rounded-[7px] border text-sm font-medium cursor-pointer capitalize transition-all",
                statusFilter === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading feedback...
        </div>
      ) : filtered.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<SlidersHorizontal size={22} />}
            title="No results"
            description="No feedback matches your current filters. Try adjusting your search or status filter."
            action={
              <button
                onClick={() => { handleSearch(""); handleFilter("all"); }}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={<MessageSquare size={22} />}
            title="No feedback yet"
            description="Once users submit feedback through your widget, it will appear here."
          />
        )
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-4">
            {paginated.map((fb) => (
              <FeedbackRow key={fb.id} fb={fb} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground/60">
                Showing {showingFrom}–{showingTo} of {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="text-xs text-muted-foreground/40 px-1">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={[
                          "w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all",
                          safePage === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border/80",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}