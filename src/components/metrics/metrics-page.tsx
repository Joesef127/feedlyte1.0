"use client";

import { useState } from "react";
import { AlertCircle, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useMetrics } from "@/hooks/useMetrics";

import { MetricsHeader } from "./metrics-header";
import { MetricsKpisGrid } from "./metrics-kpis-grid";
import { MetricsVolumeChart } from "./metrics-volume-chart";
import { MetricsStatusCard } from "./metrics-status-card";
import { MetricsCategoryCard } from "./metrics-category-card";
import { MetricsProjectVolumeCard } from "./metrics-project-volume-card";
import MetricsLoading from "@/app/(main)/dashboard/metrics/loading";

export function MetricsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30);
  const { data, isLoading, isError } = useMetrics(timeframe);

  if (isLoading) {
    return (
      <MetricsLoading />
    );
  }

  if (isError || !data) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-12 text-muted-foreground ${
          embedded ? "min-h-[300px]" : "flex-1"
        }`}
      >
        <AlertCircle size={32} className="text-destructive mb-2" />
        <p className="text-sm font-medium text-foreground">
          Failed to load metrics.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  const {
    kpis,
    volumeTrend,
    statusDistribution,
    categoryDistribution,
    projectVolume,
  } = data;
  const hasData = kpis.totalFeedback > 0;

  const activeStatuses = statusDistribution.filter((s) => s.count > 0);
  const activeCategories = categoryDistribution.filter((c) => c.count > 0);

  return (
    <div
      className={
        embedded
          ? "flex flex-col gap-6"
          : "flex-1 px-6 sm:px-9 py-8 overflow-y-auto"
      }
    >
      <MetricsHeader
        embedded={embedded}
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
      />

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No metrics available yet"
          description={`No feedback submissions recorded in the last ${timeframe} days across your projects.`}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <MetricsKpisGrid kpis={kpis} timeframe={timeframe} />

          <MetricsVolumeChart
            volumeTrend={volumeTrend}
            timeframe={timeframe}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricsStatusCard
              activeStatuses={activeStatuses}
              statusDistribution={statusDistribution}
            />

            <MetricsCategoryCard
              activeCategories={activeCategories}
              totalFeedback={kpis.totalFeedback}
            />

            <MetricsProjectVolumeCard projectVolume={projectVolume} />
          </div>
        </div>
      )}
    </div>
  );
}
