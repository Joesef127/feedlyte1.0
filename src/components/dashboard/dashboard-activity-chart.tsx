"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendTooltipProps {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string; dataKey?: string }[];
  label?: string;
}

function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 border border-border backdrop-blur-md rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      {payload.map((entry, index) => {
        const isResolved = entry.dataKey === "resolved";
        return (
          <div
            key={index}
            className="flex items-center justify-between gap-4 font-semibold text-foreground py-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isResolved ? "#22C55E" : "var(--primary)" }}
              />
              <span className="text-muted-foreground capitalize">
                {isResolved ? "Resolved" : "Submissions"}:
              </span>
            </div>
            <span>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

interface DashboardActivityChartProps {
  trendData: { label: string; count: number; resolved?: number }[];
  resolutionRate: number;
  timeframe: "7d" | "30d" | "90d";
}

export function DashboardActivityChart({
  trendData,
  resolutionRate,
  timeframe,
}: DashboardActivityChartProps) {
  const tickInterval = timeframe === "7d" ? 1 : timeframe === "90d" ? 12 : 5;

  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
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
            Submissions and resolutions (
            {timeframe === "7d"
              ? "last 7 days"
              : timeframe === "90d"
                ? "last 90 days"
                : "last 30 days"}
            )
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground font-medium">Submissions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground font-medium">Resolved</span>
          </div>
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
              <Line
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#22C55E" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
