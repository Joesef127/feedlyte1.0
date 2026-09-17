"use client";

import {
  LayoutGrid,
  MessageSquare,
  Eye,
  CheckCircle,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";

interface DashboardStatsGridProps {
  totalProjects: number;
  totalFeedback: number;
  unreviewed: number;
  reviewed: number;
  resolved: number;
}

export function DashboardStatsGrid({
  totalProjects,
  totalFeedback,
  unreviewed,
  reviewed,
  resolved,
}: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      <StatCard
        label="Projects"
        value={totalProjects}
        icon={LayoutGrid}
      />
      <StatCard
        label="Total Feedback"
        value={totalFeedback}
        icon={MessageSquare}
      />
      <StatCard
        label="Unreviewed"
        value={unreviewed}
        icon={Eye}
        accent="text-amber-500"
      />
      <StatCard
        label="Reviewed"
        value={reviewed}
        icon={Eye}
        accent="text-blue-500"
      />
      <StatCard
        label="Resolved"
        value={resolved}
        icon={CheckCircle}
        accent="text-green-500"
      />
    </div>
  );
}
