"use client";

import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Star,
  AlertCircle,
  FolderKanban,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricsKpisGridProps {
  kpis: {
    totalFeedback: number;
    resolutionRate: number;
    resolved: number;
    avgResolutionTime: string;
    avgRating: number | null;
    unreviewed: number;
    activeProjects: number;
  };
  timeframe: 7 | 30 | 90;
}

export function MetricsKpisGrid({ kpis, timeframe }: MetricsKpisGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* Total Submissions */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Submissions
          </span>
          <MessageSquare size={16} className="text-primary/70" />
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {kpis.totalFeedback}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Last {timeframe} days
          </p>
        </div>
      </Card>

      {/* Resolution Rate */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Resolution
          </span>
          <CheckCircle2 size={16} className="text-emerald-500" />
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {kpis.resolutionRate}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
            {kpis.resolved} marked resolved
          </p>
        </div>
      </Card>

      {/* Avg Resolution Time */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Avg Time
          </span>
          <Clock size={16} className="text-blue-500" />
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {kpis.avgResolutionTime}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">To resolution</p>
        </div>
      </Card>

      {/* Avg Rating */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Avg Rating
          </span>
          <Star size={16} className="text-amber-500 fill-amber-500/20" />
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {kpis.avgRating !== null ? `${kpis.avgRating} / 5` : "N/A"}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Customer sentiment</p>
        </div>
      </Card>

      {/* Unreviewed / Backlog */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Unreviewed
          </span>
          <AlertCircle size={16} className="text-amber-500" />
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {kpis.unreviewed}
          </span>
          <p className="text-[11px] text-amber-500/90 font-medium mt-0.5">
            Requires attention
          </p>
        </div>
      </Card>

      {/* Active Projects */}
      <Card className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Projects
          </span>
          <FolderKanban size={16} className="text-muted-foreground/60" />
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {kpis.activeProjects}
          </span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Monitored widgets</p>
        </div>
      </Card>
    </div>
  );
}
