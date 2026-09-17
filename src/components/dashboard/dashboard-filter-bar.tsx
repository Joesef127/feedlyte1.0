"use client";

import { Filter } from "lucide-react";

interface DashboardFilterBarProps {
  selectedProject: string;
  onSelectProject: (projectId: string) => void;
  projects: { id: string; name: string }[];
  timeframe: "7d" | "30d" | "90d";
  onSelectTimeframe: (tf: "7d" | "30d" | "90d") => void;
}

export function DashboardFilterBar({
  selectedProject,
  onSelectProject,
  projects,
  timeframe,
  onSelectTimeframe,
}: DashboardFilterBarProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Project Selector */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <Filter size={15} className="text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
          Project:
        </span>
        <select
          value={selectedProject}
          onChange={(e) => onSelectProject(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-56"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center bg-secondary/80 border border-border p-0.5 rounded-lg w-full sm:w-auto justify-center">
        {(["7d", "30d", "90d"] as const).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => onSelectTimeframe(tf)}
            className={[
              "px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer",
              timeframe === tf
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "90 Days"}
          </button>
        ))}
      </div>
    </div>
  );
}
