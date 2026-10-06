"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unreviewed:   { label: "Unreviewed",   color: "#F59E0B" },
  in_review:    { label: "In Review",    color: "#3B82F6" },
  in_progress:  { label: "In Progress",  color: "#8B5CF6" },
  accepted:     { label: "Accepted",     color: "#10B981" },
  resolved:     { label: "Resolved",     color: "#22C55E" },
  closed:       { label: "Closed",       color: "#94A3B8" },
  not_feasible: { label: "Not Feasible", color: "#64748B" },
  spam:         { label: "Spam",         color: "#EF4444" },
};

interface TrendTooltipProps {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string; dataKey?: string }[];
  label?: string;
}

function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 border border-border backdrop-blur-md rounded-lg px-3 py-2.5 text-xs shadow-xl min-w-[150px]">
      <p className="text-muted-foreground font-medium mb-1.5 border-b border-border/50 pb-1">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const color = entry.color || "var(--primary)";
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 font-semibold text-foreground py-0.5"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-muted-foreground font-medium">
                  {entry.name}:
                </span>
              </div>
              <span className="font-semibold text-foreground">{entry.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface DashboardActivityChartProps {
  trendData: {
    date?: string;
    label: string;
    count: number;
    resolved?: number;
    unreviewed?: number;
    in_review?: number;
    in_progress?: number;
    accepted?: number;
    closed?: number;
    not_feasible?: number;
    spam?: number;
    [key: string]: string | number | undefined;
  }[];
  resolutionRate: number;
  timeframe: "7d" | "30d" | "90d";
  activeStatuses?: { status: string; label: string; count: number; color: string }[];
  totalFeedback?: number;
}

export function DashboardActivityChart({
  trendData,
  resolutionRate,
  timeframe,
  activeStatuses,
  totalFeedback,
}: DashboardActivityChartProps) {
  const tickInterval = timeframe === "7d" ? 1 : timeframe === "90d" ? 12 : 5;
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  // Derive status metadata: use activeStatuses if provided, otherwise sum from trendData
  const derivedStatuses = useMemo(() => {
    if (activeStatuses && activeStatuses.length > 0) {
      return activeStatuses;
    }
    const sums: Record<string, number> = {};
    for (const pt of trendData) {
      for (const key of Object.keys(STATUS_CONFIG)) {
        const val = typeof pt[key] === "number" ? (pt[key] as number) : 0;
        sums[key] = (sums[key] || 0) + val;
      }
    }
    return Object.entries(sums)
      .filter(([_, cnt]) => cnt > 0)
      .map(([status, cnt]) => ({
        status,
        label: STATUS_CONFIG[status]?.label ?? status,
        color: STATUS_CONFIG[status]?.color ?? "#94A3B8",
        count: cnt,
      }));
  }, [activeStatuses, trendData]);

  const totalCount = useMemo(() => {
    if (typeof totalFeedback === "number" && totalFeedback > 0) {
      return totalFeedback;
    }
    return trendData.reduce((acc, cur) => acc + (cur.count || 0), 0);
  }, [totalFeedback, trendData]);

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasHidden = Object.values(hiddenSeries).some(Boolean);
  const showAll = () => setHiddenSeries({});

  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex flex-wrap flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
              Feedback Activity Trend
            </h2>
            {resolutionRate > 0 && (
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                {resolutionRate}% resolved
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Volume & lifecycle trends (
            {timeframe === "7d"
              ? "last 7 days"
              : timeframe === "90d"
                ? "last 90 days"
                : "last 30 days"}
            )
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] text-muted-foreground">
            {derivedStatuses.length} {derivedStatuses.length === 1 ? "status" : "statuses"} tracked
          </span>
          {hasHidden && (
            <button
              type="button"
              onClick={showAll}
              className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {trendData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
          No activity recorded for this period.
        </div>
      ) : (
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dashboardTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(val, i) => (i % tickInterval === 0 ? val : "")}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip content={<TrendTooltip />} />
              {!hiddenSeries["count"] && (
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Submissions"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#dashboardTrendGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--primary)" }}
                />
              )}
              {derivedStatuses.map((s) => {
                if (hiddenSeries[s.status]) return null;
                return (
                  <Line
                    key={s.status}
                    type="monotone"
                    dataKey={s.status}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: s.color }}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status Breakdown & Series Toggle List */}
      {derivedStatuses.length > 0 && (
        <div className="w-full mt-4 pt-3.5 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Lifecycle States ({derivedStatuses.length})
            </span>
            <span className="text-[10px] text-muted-foreground">
              Click to toggle lines on chart
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {/* Total Submissions series toggle */}
            <button
              type="button"
              onClick={() => toggleSeries("count")}
              title={`Click to ${!hiddenSeries["count"] ? "hide" : "show"} Submissions on chart`}
              className={[
                "flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all text-left cursor-pointer",
                !hiddenSeries["count"]
                  ? "bg-primary/10 border-primary/30 hover:bg-primary/20 text-foreground"
                  : "bg-transparent border-transparent text-muted-foreground/50 opacity-40 hover:opacity-75",
              ].join(" ")}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 bg-primary"
                  style={{
                    boxShadow: !hiddenSeries["count"]
                      ? "0 0 6px var(--primary)"
                      : "none",
                  }}
                />
                <span className="font-medium truncate">Submissions</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold shrink-0 ml-1.5">
                <span className="text-muted-foreground/60 text-[11px] font-normal">
                  100%
                </span>
                <span>{totalCount}</span>
              </div>
            </button>

            {/* Individual active statuses */}
            {derivedStatuses.map((item) => {
              const isVisible = !hiddenSeries[item.status];
              const pct =
                totalCount > 0
                  ? Math.round((item.count / totalCount) * 100)
                  : 0;
              return (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => toggleSeries(item.status)}
                  title={`Click to ${isVisible ? "hide" : "show"} ${item.label} on chart`}
                  className={[
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all text-left cursor-pointer",
                    isVisible
                      ? "bg-secondary/40 border-border hover:bg-secondary/80 text-foreground"
                      : "bg-transparent border-transparent text-muted-foreground/50 opacity-40 hover:opacity-75",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: item.color,
                        boxShadow: isVisible
                          ? `0 0 6px ${item.color}88`
                          : "none",
                      }}
                    />
                    <span className="font-medium truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold shrink-0 ml-1.5">
                    <span className="text-muted-foreground/60 text-[11px] font-normal">
                      {pct}%
                    </span>
                    <span>{item.count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
