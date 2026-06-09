"use client";

import { useState } from "react";
import { MessageSquare, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Feedback, Status } from "@/types";
import { FeedbackRow } from "./feedback-row";
import { FeedbackCard } from "./feedback-card";
import { FilterBar, applyFeedbackFilters, type FeedbackFilters, type LayoutMode } from "./filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { exportFeedbackCSV } from "@/lib/export-csv";
import type { FilterOption } from "@/components/ui/filter-dropdown";

interface FeedbackTableProps {
  feedback:       Feedback[];
  isLoading?:     boolean;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete:       (id: string) => void;
  projects?:      FilterOption[];
  projectMap?:    Record<string, { name: string; color: string }>;
}

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: FeedbackFilters = {
  search:    "",
  status:    "",
  timeRange: "",
  projectId: "",
};

export function FeedbackTable({
  feedback,
  isLoading,
  onUpdateStatus,
  onDelete,
  projects,
  projectMap = {},
}: FeedbackTableProps) {
  const [filters, setFilters] = useState<FeedbackFilters>(DEFAULT_FILTERS);
  const [layout,  setLayout]  = useState<LayoutMode>("list");
  const [page,    setPage]    = useState(1);

  const handleFiltersChange = (f: FeedbackFilters) => {
    setFilters(f);
    setPage(1);
  };

  const filtered    = applyFeedbackFilters(feedback, filters);
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo   = Math.min(safePage * PAGE_SIZE, filtered.length);
  const hasFilters  = filters.search || filters.status || filters.timeRange || filters.projectId;

  const handleExport = () => {
    exportFeedbackCSV(filtered, projectMap);
  };

  return (
    <div>
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        layout={layout}
        onLayoutChange={setLayout}
        projects={projects}
        onExport={feedback.length > 0 ? handleExport : undefined}
        exportCount={filtered.length}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading feedback...
        </div>
      ) : filtered.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<SlidersHorizontal size={22} />}
            title="No results"
            description="No feedback matches your current filters. Try adjusting your search or filters."
            action={
              <button
                onClick={() => handleFiltersChange(DEFAULT_FILTERS)}
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
          {layout === "list" && (
            <div className="flex flex-col gap-2 mb-4">
              {paginated.map((fb) => (
                <FeedbackRow
                  key={fb.id}
                  fb={fb}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                  projectName={projectMap[fb.projectId]?.name}
                  projectColor={projectMap[fb.projectId]?.color}
                />
              ))}
            </div>
          )}

          {layout === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {paginated.map((fb) => (
                <FeedbackCard
                  key={fb.id}
                  fb={fb}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                  projectName={projectMap[fb.projectId]?.name}
                  projectColor={projectMap[fb.projectId]?.color}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground/60">
                Showing {showingFrom}–{showingTo} of {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                      <span key={`ellipsis-${i}`} className="text-xs text-muted-foreground/40 px-1">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={[
                          "w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all",
                          safePage === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-transparent text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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