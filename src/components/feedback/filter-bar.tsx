"use client";

import {
  Search,
  LayoutGrid,
  List,
  Funnel,
  X,
  FileText,
  FileType,
  FileSpreadsheet,
  Bug,
  Lightbulb,
  Heart,
  HelpCircle,
  Tag,
  UserCheck,
  Sparkles,
} from "lucide-react";
import {
  FilterDropdown,
  type FilterOption,
} from "@/components/ui/filter-dropdown";
import { useState } from "react";

export type LayoutMode = "list" | "card";

export interface FeedbackFilters {
  search: string;
  status: string;
  category: string;
  timeRange: string;
  projectId: string;
  tag?: string;
  assignedTo?: string;
  view?: string;
}

export const DEFAULT_FEEDBACK_FILTERS: FeedbackFilters = {
  search: "",
  status: "",
  category: "",
  timeRange: "",
  projectId: "",
  tag: "",
  assignedTo: "",
  view: "all",
};

interface FilterBarProps {
  filters: FeedbackFilters;
  onFiltersChange: (filters: FeedbackFilters) => void;
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  projects?: FilterOption[];
  tags?: FilterOption[];
  assignees?: FilterOption[];
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onExportPDF?: () => void;
  exportCount?: number;
}

const STATUS_OPTIONS: FilterOption[] = [
  { id: "unreviewed", label: "Unreviewed" },
  { id: "in_review", label: "In Review" },
  { id: "accepted", label: "Accepted" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
  { id: "not_feasible", label: "Not Feasible" },
  { id: "closed", label: "Closed" },
  { id: "spam", label: "Spam" },
];

const CATEGORY_OPTIONS: FilterOption[] = [
  { id: "bug", label: "Bug", icon: Bug },
  { id: "idea", label: "Idea", icon: Lightbulb },
  { id: "praise", label: "Praise", icon: Heart },
  { id: "question", label: "Question", icon: HelpCircle },
];

const TIME_OPTIONS: FilterOption[] = [
  { id: "today", label: "Today" },
  { id: "3days", label: "Last 3 days" },
  { id: "7days", label: "Last 7 days" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
];

const EXPORT_OPTIONS: FilterOption[] = [
  { id: "csv", label: "Export as CSV", icon: FileSpreadsheet },
  { id: "json", label: "Export as JSON", icon: FileText },
  { id: "pdf", label: "Export as PDF", icon: FileType },
];

export const SAVED_VIEWS = [
  { id: "all", label: "All Feedback" },
  { id: "triage", label: "Needs Triage" },
  { id: "active", label: "Active Work" },
  { id: "bugs", label: "Bugs Only" },
  { id: "ideas", label: "Ideas & Praise" },
  { id: "resolved", label: "Resolved" },
] as const;

export function FilterBar({
  filters,
  onFiltersChange,
  layout,
  onLayoutChange,
  projects,
  tags = [],
  assignees = [],
  onExportCSV,
  onExportJSON,
  onExportPDF,
  exportCount,
}: FilterBarProps) {
  const set = (key: keyof FeedbackFilters) => (value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const hasFilters =
    Boolean(
      filters.search ||
      filters.status ||
      filters.category ||
      filters.timeRange ||
      filters.projectId ||
      filters.tag ||
      filters.assignedTo ||
      (filters.view && filters.view !== "all")
    );

  const [showFilters, setShowFilters] = useState<boolean>(false);

  const handleExport = (format: string) => {
    if (format === "csv") onExportCSV?.();
    else if (format === "json") onExportJSON?.();
    else if (format === "pdf") onExportPDF?.();
  };

  const handleSelectView = (viewId: string) => {
    if (viewId === "all") {
      onFiltersChange({
        ...filters,
        view: "all",
        status: "",
        category: "",
      });
    } else if (viewId === "triage") {
      onFiltersChange({
        ...filters,
        view: "triage",
        status: "unreviewed",
        category: "",
      });
    } else if (viewId === "active") {
      onFiltersChange({
        ...filters,
        view: "active",
        status: "",
        category: "",
      });
    } else if (viewId === "bugs") {
      onFiltersChange({
        ...filters,
        view: "bugs",
        status: "",
        category: "bug",
      });
    } else if (viewId === "ideas") {
      onFiltersChange({
        ...filters,
        view: "ideas",
        status: "",
        category: "",
      });
    } else if (viewId === "resolved") {
      onFiltersChange({
        ...filters,
        view: "resolved",
        status: "resolved",
        category: "",
      });
    }
  };

  const activeView = filters.view || "all";

  return (
    <div className="mb-5 flex flex-col gap-3">
      {/* Saved views preset tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80">
          <div className="flex items-center gap-1 px-2 text-xs font-semibold text-muted-foreground shrink-0">
            <span>Views:</span>
          </div>
          {SAVED_VIEWS.map((sv) => {
            const isSelected = activeView === sv.id;
            return (
              <button
                key={sv.id}
                onClick={() => handleSelectView(sv.id)}
                className={[
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer",
                  isSelected
                    ? "bg-card text-foreground shadow-xs font-semibold border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                ].join(" ")}
              >
                {sv.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Layout toggle */}
        <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5 shrink-0 bg-card">
          <button
            onClick={() => onLayoutChange("list")}
            title="List view"
            className={[
              "w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer",
              layout === "list"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <List size={14} />
          </button>

          <button
            onClick={() => onLayoutChange("card")}
            title="Card view"
            className={[
              "w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer",
              layout === "card"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <LayoutGrid size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={14} className="text-muted-foreground" />
          </div>

          <input
            value={filters.search}
            onChange={(e) => set("search")(e.target.value)}
            placeholder="Search message, email, URL, or tags..."
            className="w-full bg-card border border-border rounded-lg py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="md:hidden h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          {showFilters ? <X size={16} /> : <Funnel size={16} />}
        </button>

        {/* Desktop filters */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(val) => {
              set("status")(val);
              if (val) set("view")("");
            }}
            allLabel="All statuses"
          />

          <FilterDropdown
            label="Category"
            options={CATEGORY_OPTIONS}
            value={filters.category}
            onChange={(val) => {
              set("category")(val);
              if (val) set("view")("");
            }}
            allLabel="All categories"
          />

          {tags.length > 0 && (
            <FilterDropdown
              label="Tag"
              options={tags}
              value={filters.tag ?? ""}
              onChange={set("tag")}
              allLabel="All tags"
            />
          )}

          {assignees.length > 0 && (
            <FilterDropdown
              label="Assignee"
              options={assignees}
              value={filters.assignedTo ?? ""}
              onChange={set("assignedTo")}
              allLabel="All assignees"
            />
          )}

          <FilterDropdown
            label="Time"
            options={TIME_OPTIONS}
            value={filters.timeRange}
            onChange={set("timeRange")}
            allLabel="All time"
          />

          {projects && projects.length > 0 && (
            <FilterDropdown
              label="Project"
              options={projects}
              value={filters.projectId}
              onChange={set("projectId")}
              allLabel="All projects"
            />
          )}

          {/* Export Dropdown */}
          {(onExportCSV || onExportJSON || onExportPDF) && (
            <FilterDropdown
              label="Export"
              options={EXPORT_OPTIONS}
              value=""
              onChange={handleExport}
              allLabel=""
            />
          )}

          {hasFilters && (
            <button
              onClick={() => onFiltersChange(DEFAULT_FEEDBACK_FILTERS)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Mobile filters expansion */}
      {showFilters && (
        <div className="md:hidden flex flex-wrap gap-2 pt-2 border-t border-border">
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(val) => {
              set("status")(val);
              if (val) set("view")("");
            }}
            allLabel="All statuses"
          />

          <FilterDropdown
            label="Category"
            options={CATEGORY_OPTIONS}
            value={filters.category}
            onChange={(val) => {
              set("category")(val);
              if (val) set("view")("");
            }}
            allLabel="All categories"
          />

          {tags.length > 0 && (
            <FilterDropdown
              label="Tag"
              options={tags}
              value={filters.tag ?? ""}
              onChange={set("tag")}
              allLabel="All tags"
            />
          )}

          {assignees.length > 0 && (
            <FilterDropdown
              label="Assignee"
              options={assignees}
              value={filters.assignedTo ?? ""}
              onChange={set("assignedTo")}
              allLabel="All assignees"
            />
          )}

          <FilterDropdown
            label="Time"
            options={TIME_OPTIONS}
            value={filters.timeRange}
            onChange={set("timeRange")}
            allLabel="All time"
          />

          {projects && projects.length > 0 && (
            <FilterDropdown
              label="Project"
              options={projects}
              value={filters.projectId}
              onChange={set("projectId")}
              allLabel="All projects"
            />
          )}

          {(onExportCSV || onExportJSON || onExportPDF) && (
            <FilterDropdown
              label="Export"
              options={EXPORT_OPTIONS}
              value=""
              onChange={handleExport}
              allLabel=""
            />
          )}

          {hasFilters && (
            <button
              onClick={() => onFiltersChange(DEFAULT_FEEDBACK_FILTERS)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-muted-foreground"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Filter logic helper ───────────────────────────────────────────────────────

export function applyFeedbackFilters<
  T extends {
    status: string;
    message: string;
    email: string;
    pageUrl: string;
    createdAt: string;
    projectId: string;
    category?: string | null;
    tags?: string[];
    assignedToId?: string | null;
  },
>(items: T[], filters: FeedbackFilters): T[] {
  return items.filter((f) => {
    // 1. Saved views
    if (filters.view && filters.view !== "all") {
      const normalizedStatus = f.status === "reviewed" ? "in_review" : f.status;
      if (filters.view === "triage") {
        if (normalizedStatus !== "unreviewed") return false;
      } else if (filters.view === "active") {
        if (!["in_review", "accepted", "in_progress"].includes(normalizedStatus)) return false;
      } else if (filters.view === "bugs") {
        if (f.category !== "bug") return false;
      } else if (filters.view === "ideas") {
        if (f.category !== "idea" && f.category !== "praise") return false;
      } else if (filters.view === "resolved") {
        if (normalizedStatus !== "resolved") return false;
      }
    }

    // 2. Explicit status filter
    if (filters.status) {
      const itemStatus = f.status === "reviewed" ? "in_review" : f.status;
      const filterStatus = filters.status === "reviewed" ? "in_review" : filters.status;
      if (itemStatus !== filterStatus) return false;
    }

    // 3. Category filter
    if (filters.category && f.category !== filters.category) return false;

    // 4. Project filter
    if (filters.projectId && f.projectId !== filters.projectId) return false;

    // 5. Tag filter
    if (filters.tag && (!f.tags || !f.tags.includes(filters.tag))) return false;

    // 6. Assignee filter
    if (filters.assignedTo) {
      if (filters.assignedTo === "unassigned") {
        if (f.assignedToId) return false;
      } else if (f.assignedToId !== filters.assignedTo) {
        return false;
      }
    }

    // 7. Search text
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        f.message.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.pageUrl.toLowerCase().includes(q) ||
        (f.tags && f.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }

    // 8. Time range
    if (filters.timeRange) {
      const days =
        (Date.now() - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (filters.timeRange === "today" && days > 1) return false;
      if (filters.timeRange === "3days" && days > 3) return false;
      if (filters.timeRange === "7days" && days > 7) return false;
      if (filters.timeRange === "month" && days > 30) return false;
      if (filters.timeRange === "year" && days > 365) return false;
    }

    return true;
  });
}