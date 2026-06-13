"use client";

import { Search, LayoutGrid, List, Download, Funnel, X, FileText, FileType, FileSpreadsheet } from "lucide-react";
import {
  FilterDropdown,
  type FilterOption,
} from "@/components/ui/filter-dropdown";
import type { Status } from "@/types";
import { useState } from "react";

export type LayoutMode = "list" | "card";

export interface FeedbackFilters {
  search: string;
  status: string;
  timeRange: string;
  projectId: string;
}

interface FilterBarProps {
  filters: FeedbackFilters;
  onFiltersChange: (filters: FeedbackFilters) => void;
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  projects?: FilterOption[];
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onExportPDF?: () => void; 
  exportCount?: number;
}

const STATUS_OPTIONS: FilterOption[] = [
  { id: "unreviewed", label: "Unreviewed" },
  { id: "reviewed", label: "Reviewed" },
  { id: "resolved", label: "Resolved" },
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

export function FilterBar({
  filters,
  onFiltersChange,
  layout,
  onLayoutChange,
  projects,
  onExportCSV,
  onExportJSON,
  onExportPDF,
  exportCount,
}: FilterBarProps) {
  const set = (key: keyof FeedbackFilters) => (value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const hasFilters =
    filters.search || filters.status || filters.timeRange || filters.projectId;

  const [showFilters, setShowFilters] = useState<boolean>(false);

  const handleExport = (format: string) => {
    if (format === "csv") onExportCSV?.();
    else if (format === "json") onExportJSON?.();
    else if (format === "pdf") onExportPDF?.();
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Layout toggle */}
        <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5 shrink-0">
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
            placeholder="Search feedback..."
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
            onChange={set("status")}
            allLabel="All statuses"
          />

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

          {/* Export Dropdown - FIXED: includes onExportPDF */}
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
              onClick={() =>
                onFiltersChange({
                  search: "",
                  status: "",
                  timeRange: "",
                  projectId: "",
                })
              }
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile filters */}
      {showFilters && (
        <div className="md:hidden flex flex-wrap gap-2 mt-3">
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={set("status")}
            allLabel="All statuses"
          />

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

          {/* Export Dropdown - FIXED: includes onExportPDF */}
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
              onClick={() =>
                onFiltersChange({
                  search: "",
                  status: "",
                  timeRange: "",
                  projectId: "",
                })
              }
              className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-muted-foreground"
            >
              Clear
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
  },
>(items: T[], filters: FeedbackFilters): T[] {
  return items.filter((f) => {
    if (filters.status && f.status !== filters.status) return false;
    if (filters.projectId && f.projectId !== filters.projectId) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        f.message.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.pageUrl.toLowerCase().includes(q);
      if (!match) return false;
    }

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