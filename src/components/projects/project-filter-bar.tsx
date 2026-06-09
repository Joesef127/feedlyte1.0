"use client";

import { useState } from "react";
import { Search, Funnel, X } from "lucide-react";
import {
  FilterDropdown,
  type FilterOption,
} from "@/components/ui/filter-dropdown";

export interface ProjectFilters {
  search: string;
  position: string;
  sortBy: string;
}

interface ProjectFilterBarProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}

const SORT_OPTIONS: FilterOption[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "name-asc", label: "Name A-Z" },
  { id: "name-desc", label: "Name Z-A" },
  { id: "feedback-desc", label: "Most Feedback" },
  { id: "feedback-asc", label: "Least Feedback" },
];

const POSITION_OPTIONS: FilterOption[] = [
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
];

export function ProjectFilterBar({
  filters,
  onFiltersChange,
}: ProjectFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const set =
    (key: keyof ProjectFilters) =>
    (value: string) =>
      onFiltersChange({
        ...filters,
        [key]: value,
      });

  const hasFilters =
    filters.search ||
    filters.position ||
    filters.sortBy !== "newest";

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            value={filters.search}
            onChange={(e) => set("search")(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-card border border-border rounded-lg py-2 pl-8 pr-3 text-sm"
          />
        </div>

        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-card"
        >
          {showFilters ? <X size={16} /> : <Funnel size={16} />}
        </button>

        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <FilterDropdown
            label="Position"
            options={POSITION_OPTIONS}
            value={filters.position}
            onChange={set("position")}
            allLabel="All positions"
          />

          <FilterDropdown
            label="Sort"
            options={SORT_OPTIONS}
            value={filters.sortBy}
            onChange={set("sortBy")}
          />

          {hasFilters && (
            <button
              onClick={() =>
                onFiltersChange({
                  search: "",
                  position: "",
                  sortBy: "newest",
                })
              }
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="md:hidden flex flex-wrap gap-2 mt-3">
          <FilterDropdown
            label="Position"
            options={POSITION_OPTIONS}
            value={filters.position}
            onChange={set("position")}
            allLabel="All positions"
          />

          <FilterDropdown
            label="Sort"
            options={SORT_OPTIONS}
            value={filters.sortBy}
            onChange={set("sortBy")}
          />

          {hasFilters && (
            <button
              onClick={() =>
                onFiltersChange({
                  search: "",
                  position: "",
                  sortBy: "newest",
                })
              }
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}