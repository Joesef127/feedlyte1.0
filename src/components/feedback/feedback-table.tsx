"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckSquare,
  Square,
} from "lucide-react";
import type { Feedback, Status } from "@/types";
import { FeedbackRow } from "./feedback-row";
import { FeedbackCard } from "./feedback-card";
import {
  FilterBar,
  applyFeedbackFilters,
  type FeedbackFilters,
  type LayoutMode,
  DEFAULT_FEEDBACK_FILTERS,
} from "./filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  exportFeedbackCSV,
  exportFeedbackJSON,
  exportFeedbackPDF,
} from "@/lib/export";
import { BulkActionBar } from "./bulk-action-bar";
import type { FilterOption } from "@/components/ui/filter-dropdown";
import { useBulkFeedbackAction } from "@/hooks/use-feedback";
import { friendlyError } from "@/lib/error-messages";
import { toast } from "sonner";

interface FeedbackTableProps {
  feedback: Feedback[];
  isLoading?: boolean;
  onUpdateStatus: (id: string, status: Status) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  projects?: FilterOption[];
  projectMap?: Record<string, { name: string; color: string }>;
}

const PAGE_SIZE = 10;

export function FeedbackTable({
  feedback,
  isLoading,
  onUpdateStatus,
  onDelete,
  projects,
  projectMap = {},
}: FeedbackTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bulkAction = useBulkFeedbackAction();

  // Read initial filter values from URL query parameters
  const initialFilters: FeedbackFilters = useMemo(() => {
    return {
      search:     searchParams.get("q") || searchParams.get("search") || "",
      status:     searchParams.get("status") || "",
      category:   searchParams.get("category") || "",
      timeRange:  searchParams.get("timeRange") || "",
      projectId:  searchParams.get("project") || searchParams.get("projectId") || "",
      tag:        searchParams.get("tag") || "",
      assignedTo: searchParams.get("assignedTo") || "",
      view:       searchParams.get("view") || "all",
      sortBy:     searchParams.get("sortBy") || searchParams.get("sort") || "newest",
    };
  }, [searchParams]);

  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10) || 1;

  const [filters, setFilters] = useState<FeedbackFilters>(initialFilters);
  const [layout, setLayout] = useState<LayoutMode>("list");
  const [page, setPage] = useState(initialPage);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);

  // Sync state to URL
  const updateUrl = useCallback(
    (newFilters: FeedbackFilters, newPage: number) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("q", newFilters.search);
      if (newFilters.status) params.set("status", newFilters.status);
      if (newFilters.category) params.set("category", newFilters.category);
      if (newFilters.timeRange) params.set("timeRange", newFilters.timeRange);
      if (newFilters.projectId) params.set("project", newFilters.projectId);
      if (newFilters.tag) params.set("tag", newFilters.tag);
      if (newFilters.assignedTo) params.set("assignedTo", newFilters.assignedTo);
      if (newFilters.view && newFilters.view !== "all") params.set("view", newFilters.view);
      if (newFilters.sortBy && newFilters.sortBy !== "newest") params.set("sortBy", newFilters.sortBy);
      if (newPage > 1) params.set("page", String(newPage));

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router],
  );

  const handleFiltersChange = (f: FeedbackFilters) => {
    setFilters(f);
    setPage(1);
    setSelectedIds(new Set());
    updateUrl(f, 1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    setSelectedIds(new Set());
    updateUrl(filters, p);
  };

  // Dynamically extract available tags and assignees from feedback dataset
  const availableTags: FilterOption[] = useMemo(() => {
    const tagSet = new Set<string>();
    feedback.forEach((f) => {
      f.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet)
      .sort()
      .map((t) => ({ id: t, label: `#${t}` }));
  }, [feedback]);

  const availableAssignees: FilterOption[] = useMemo(() => {
    const assigneeMap = new Map<string, string>();
    assigneeMap.set("unassigned", "Unassigned");
    feedback.forEach((f) => {
      if (f.assignedTo) {
        assigneeMap.set(f.assignedTo.id, f.assignedTo.name || f.assignedTo.email);
      }
    });
    return Array.from(assigneeMap.entries()).map(([id, label]) => ({ id, label }));
  }, [feedback]);

  const handleExportCSV = () => {
    try {
      exportFeedbackCSV(filtered, projectMap);
      toast.success(`Exported ${filtered.length} feedback item(s) to CSV`);
    } catch (error) {
      toast.error("Failed to export CSV");
      console.error("CSV export error:", error);
    }
  };

  const handleExportJSON = () => {
    try {
      exportFeedbackJSON(filtered, projectMap);
      toast.success(`Exported ${filtered.length} feedback item(s) to JSON`);
    } catch (error) {
      toast.error("Failed to export JSON");
      console.error("JSON export error:", error);
    }
  };

  const handleExportPDF = () => {
    try {
      exportFeedbackPDF(filtered, projectMap);
      toast.success(`Exported ${filtered.length} feedback item(s) to PDF`);
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error("PDF export error:", error);
    }
  };

  const filtered = useMemo(() => {
    const res = applyFeedbackFilters(feedback, filters);
    const sortBy = filters.sortBy || "newest";
    return [...res].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "rating_desc") {
        const rA = typeof a.rating === "number" ? a.rating : -1;
        const rB = typeof b.rating === "number" ? b.rating : -1;
        if (rB !== rA) return rB - rA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "rating_asc") {
        const rA = typeof a.rating === "number" ? a.rating : 999;
        const rB = typeof b.rating === "number" ? b.rating : 999;
        if (rA !== rB) return rA - rB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      // default "newest"
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [feedback, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const showingFrom =
    filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, filtered.length);
  const hasFilters = Boolean(
    filters.search ||
    filters.status ||
    filters.category ||
    filters.timeRange ||
    filters.projectId ||
    filters.tag ||
    filters.assignedTo ||
    (filters.view && filters.view !== "all")
  );

  const selectAllPage = useCallback(() => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((fb) => fb.id)));
    }
  }, [paginated, selectedIds]);

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Atomic bulk operations
  const bulkUpdateStatus = async (status: Status) => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    try {
      await bulkAction.mutateAsync({
        action: "status",
        feedbackIds: Array.from(selectedIds),
        status,
      });
      toast.success(
        `Updated ${selectedIds.size} feedback item${selectedIds.size !== 1 ? "s" : ""} to "${status.replace("_", " ")}"`,
      );
      clearSelection();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBulkPending(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    try {
      await bulkAction.mutateAsync({
        action: "delete",
        feedbackIds: Array.from(selectedIds),
      });
      toast.success(`Deleted ${selectedIds.size} feedback item(s)`);
      clearSelection();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBulkPending(false);
    }
  };

  const bulkTag = async (tags: string[], operation: "add" | "remove") => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    try {
      await bulkAction.mutateAsync({
        action: "tag",
        feedbackIds: Array.from(selectedIds),
        tags,
        operation,
      });
      toast.success(`Updated tags for ${selectedIds.size} feedback item(s)`);
      clearSelection();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBulkPending(false);
    }
  };

  // Compute project context for bulk bar
  const selectedFeedback = paginated.filter((fb) => selectedIds.has(fb.id));
  const projectNames = Array.from(
    new Set(
      selectedFeedback
        .map((fb) => projectMap[fb.projectId]?.name)
        .filter(Boolean),
    ),
  );
  const projectCount = projectNames.length;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, layout, filters]);

  useEffect(() => {
    const handleEscape = () => {
      clearSelection();
    };
    window.addEventListener("feedlyte:escape", handleEscape);
    return () => window.removeEventListener("feedlyte:escape", handleEscape);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        const target = e.target as HTMLElement;
        const isEditable =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        if (isEditable) return;
        e.preventDefault();
        selectAllPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectAllPage]);

  return (
    <div>
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        layout={layout}
        onLayoutChange={setLayout}
        projects={projects}
        tags={availableTags}
        assignees={availableAssignees}
        onExportCSV={feedback.length > 0 ? handleExportCSV : undefined}
        onExportJSON={feedback.length > 0 ? handleExportJSON : undefined}
        onExportPDF={feedback.length > 0 ? handleExportPDF : undefined}
        exportCount={filtered.length}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2 py-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<SlidersHorizontal size={22} />}
            title="No matching feedback"
            description="No feedback entries match your active view or filters. Try clearing or relaxing your search."
            action={
              <button
                onClick={() => handleFiltersChange(DEFAULT_FEEDBACK_FILTERS)}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer"
              >
                Clear all filters
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
            <div className="flex items-center gap-2 mb-2 px-4 py-2 bg-muted/30 rounded-lg border border-border">
              <button
                onClick={selectAllPage}
                className="flex items-center justify-center w-5 h-5 rounded border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
                aria-label={
                  selectedIds.size === paginated.length
                    ? "Deselect all"
                    : "Select all on page"
                }
              >
                {selectedIds.size === paginated.length ? (
                  <CheckSquare size={14} className="text-primary" />
                ) : (
                  <Square size={14} className="text-muted-foreground" />
                )}
              </button>
              <span className="text-xs text-muted-foreground">
                {selectedIds.size === paginated.length
                  ? "All selected — click to deselect"
                  : `Select all ${paginated.length} items on this page`}
              </span>
            </div>
          )}

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
                  selected={selectedIds.has(fb.id)}
                  onSelect={toggleSelect}
                  clearSelection={clearSelection}
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
                  selected={selectedIds.has(fb.id)}
                  onSelect={toggleSelect}
                  clearSelection={clearSelection}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border flex-wrap">
              <p className="text-xs text-muted-foreground">
                Showing {showingFrom}–{showingTo} of {filtered.length} item{filtered.length !== 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1,
                  )
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="text-xs text-muted-foreground/40 px-1"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p as number)}
                        className={[
                          "w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all cursor-pointer",
                          safePage === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-transparent text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <BulkActionBar
              count={selectedIds.size}
              projectCount={projectCount}
              projectNames={projectNames}
              onBulkUnreviewed={() => bulkUpdateStatus("unreviewed")}
              onBulkReviewed={() => bulkUpdateStatus("in_review")}
              onBulkResolved={() => bulkUpdateStatus("resolved")}
              onBulkStatusChange={(status) => bulkUpdateStatus(status)}
              onBulkTag={bulkTag}
              onBulkDelete={bulkDelete}
              onClear={clearSelection}
              isPending={bulkPending}
            />
          )}
        </>
      )}
    </div>
  );
}
