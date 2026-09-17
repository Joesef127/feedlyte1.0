"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Star,
  AlertCircle,
  FolderKanban,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useMetrics } from "@/hooks/useMetrics";

// ── Custom Tooltip for Area Chart ──────────────────────────────────────────────
function VolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 border border-border backdrop-blur-md rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="font-bold text-foreground text-sm">
        {payload[0].value} <span className="text-xs font-normal text-muted-foreground">submissions</span>
      </p>
    </div>
  );
}

// ── Reusable Chart Card ────────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col p-5 sm:p-6 w-full h-full bg-card border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </Card>
  );
}

export function MetricsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30);
  const { data, isLoading, isError } = useMetrics(timeframe);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-muted-foreground ${embedded ? "min-h-[300px]" : "flex-1"}`}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Gathering workspace metrics...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-muted-foreground ${embedded ? "min-h-[300px]" : "flex-1"}`}>
        <AlertCircle size={32} className="text-destructive mb-2" />
        <p className="text-sm font-medium text-foreground">Failed to load metrics.</p>
        <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const { kpis, volumeTrend, statusDistribution, categoryDistribution, projectVolume } = data;
  const hasData = kpis.totalFeedback > 0;

  // Filter out 0 count items for cleaner charts
  const activeStatuses = statusDistribution.filter((s) => s.count > 0);
  const activeCategories = categoryDistribution.filter((c) => c.count > 0);

  // X-axis tick interval
  const tickInterval = timeframe === 7 ? 0 : timeframe === 30 ? 4 : 14;
  const xAxisTick = (value: string, index: number) =>
    tickInterval === 0 || index % tickInterval === 0 ? value : "";

  return (
    <div className={embedded ? "flex flex-col gap-6" : "flex-1 px-6 sm:px-9 py-8 overflow-y-auto"}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            {embedded ? (
              <h2 className="text-lg font-bold text-foreground tracking-[-0.02em]">
                Cross-Project Analytics
              </h2>
            ) : (
              <h1 className="text-2xl font-bold text-foreground tracking-[-0.03em]">
                Global Metrics
              </h1>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Cross-project performance, volume trends, and feedback resolution analytics.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-secondary/70 border border-border p-1 rounded-xl">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={[
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer",
                timeframe === days
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 size={28} />}
          title="No metrics available yet"
          description={`No feedback submissions recorded in the last ${timeframe} days across your projects.`}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* KPI Stat Cards */}
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
                <p className="text-[11px] text-muted-foreground mt-0.5">Last {timeframe} days</p>
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

          {/* Main Chart: Feedback Volume Over Time */}
          <ChartCard
            title={`Feedback Volume (Last ${timeframe} Days)`}
            subtitle="Daily submission volume across all active project widgets"
          >
            <div className="h-64 sm:h-72 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={volumeTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="metricsVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={xAxisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<VolumeTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#metricsVolumeGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Secondary Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Breakdown Donut */}
            <ChartCard
              title="Status Breakdown"
              subtitle="Distribution of feedback lifecycle states"
            >
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width={170} height={170}>
                    <PieChart>
                      <Pie
                        data={activeStatuses}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {activeStatuses.map((item) => (
                          <Cell key={item.status} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Legend */}
                <div className="w-full flex flex-col gap-2 mt-3 pt-3 border-t border-border">
                  {statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            {/* Category Distribution */}
            <ChartCard
              title="Feedback Categories"
              subtitle="Breakdown by reported feedback category"
            >
              <div className="flex flex-col gap-3.5 pt-3">
                {activeCategories.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No categorized submissions.
                  </p>
                ) : (
                  activeCategories.map((item) => {
                    const percentage = Math.round((item.count / kpis.totalFeedback) * 100);
                    return (
                      <div key={item.category} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: item.color }}
                            />
                            <span className="font-medium text-foreground">{item.label}</span>
                          </div>
                          <span className="text-muted-foreground font-mono">
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ChartCard>

            {/* Feedback Volume by Project */}
            <ChartCard
              title="Volume by Project"
              subtitle="Comparison of feedback activity across widgets"
            >
              <div className="flex flex-col gap-3 pt-2">
                {projectVolume.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No active projects.
                  </p>
                ) : (
                  projectVolume.slice(0, 6).map((proj, i) => {
                    const max = Math.max(...projectVolume.map((p) => p.count), 1);
                    const percentage = Math.round((proj.count / max) * 100);
                    return (
                      <div key={proj.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground/40 w-4 shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-foreground truncate max-w-[70%]">
                              {proj.name}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {proj.count} submissions
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, background: proj.color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
