"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./chart-card";

function VolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
} = {}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover/95 border border-border backdrop-blur-md rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground font-medium mb-0.5">{label}</p>
      <p className="font-bold text-foreground text-sm">
        {payload[0].value}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          submissions
        </span>
      </p>
    </div>
  );
}

interface MetricsVolumeChartProps {
  volumeTrend: { label: string; count: number }[];
  timeframe: 7 | 30 | 90;
}

export function MetricsVolumeChart({
  volumeTrend,
  timeframe,
}: MetricsVolumeChartProps) {
  const tickInterval = timeframe === 7 ? 0 : timeframe === 30 ? 4 : 14;
  const xAxisTick = (value: string, index: number) =>
    tickInterval === 0 || index % tickInterval === 0 ? value : "";

  return (
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
              activeDot={{
                r: 5,
                fill: "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
