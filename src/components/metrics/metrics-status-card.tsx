"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ChartCard } from "./chart-card";

interface StatusItem {
  status: string;
  label: string;
  count: number;
  color: string;
}

interface MetricsStatusCardProps {
  activeStatuses: StatusItem[];
  statusDistribution: StatusItem[];
}

export function MetricsStatusCard({
  activeStatuses,
  statusDistribution,
}: MetricsStatusCardProps) {
  return (
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
            <div
              key={item.status}
              className="flex items-center justify-between text-xs"
            >
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
  );
}
