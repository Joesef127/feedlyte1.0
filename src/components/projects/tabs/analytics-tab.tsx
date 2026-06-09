"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface AnalyticsTabProps {
  projectId:    string;
  projectColor: string;
}

const STATUS_COLORS: Record<string, string> = {
  unreviewed: "#F59E0B",
  reviewed:   "#3B82F6",
  resolved:   "#22C55E",
};

// ── Reusable chart card ───────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: { value: number }[];
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold text-foreground">{payload[0].value} submissions</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AnalyticsTab({ projectId, projectColor }: AnalyticsTabProps) {
  const { data, isLoading } = useAnalytics(projectId);

  if (isLoading) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        Loading analytics...
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <EmptyState
        icon={<BarChart2 size={22} />}
        title="No data yet"
        description="Analytics will appear once your project starts receiving feedback."
      />
    );
  }

  // Format volume dates for display
  const volumeData = data.volumeByDay.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
    }),
  }));

  // Only show every 5th label on x-axis to avoid crowding
  const xAxisTick = (value: string, index: number) =>
    index % 5 === 0 ? value : "";

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* Volume over 30 days */}
      <ChartCard title="Feedback volume (last 30 days)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={volumeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={projectColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: projectColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Status breakdown donut */}
        <ChartCard title="Status breakdown">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {data.statusBreakdown
                    .filter((s) => s.count > 0)
                    .map((s) => (
                      <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#888"} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, String(name)]}
                  contentStyle={{
                    background:   "var(--card)",
                    border:       "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize:     "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {data.statusBreakdown.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: STATUS_COLORS[status] ?? "#888" }}
                  />
                  <span className="text-xs text-muted-foreground capitalize">{status}</span>
                  <span className="text-xs font-bold text-foreground ml-auto pl-4">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* By day of week */}
        <ChartCard title="Submissions by day of week">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.byDayOfWeek} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background:   "var(--card)",
                  border:       "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize:     "12px",
                }}
              />
              <Bar dataKey="count" fill={projectColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top pages */}
      {data.topPages.length > 0 && (
        <ChartCard title="Top pages by feedback count">
          <div className="flex flex-col gap-2">
            {data.topPages.map(({ page, count }, i) => {
              const max = data.topPages[0].count;
              const pct = Math.round((count / max) * 100);
              return (
                <div key={page} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/40 font-bold w-4 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-muted-foreground truncate max-w-[80%]">
                        {page}
                      </span>
                      <span className="text-xs font-bold text-foreground shrink-0 ml-2">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: projectColor }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}
    </div>
  );
}