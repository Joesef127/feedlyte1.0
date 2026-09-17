"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";

interface DashboardDistributionCardProps {
  distributionView: "status" | "category";
  onViewChange: (view: "status" | "category") => void;
  activeStatuses: { status: string; label: string; count: number; color: string }[];
  activeCategories: { category: string; label: string; count: number; color: string }[];
  totalFeedback: number;
}

export function DashboardDistributionCard({
  distributionView,
  onViewChange,
  activeStatuses,
  activeCategories,
  totalFeedback,
}: DashboardDistributionCardProps) {
  const totalCategorized = activeCategories.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
            Distribution
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {distributionView === "status"
              ? "Lifecycle breakdown"
              : "Category breakdown"}
          </p>
        </div>
        {/* Distribution View Switcher */}
        <div className="flex items-center bg-secondary/80 border border-border p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onViewChange("status")}
            className={[
              "px-2.5 py-1 rounded font-semibold transition-all cursor-pointer",
              distributionView === "status"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Status
          </button>
          <button
            type="button"
            onClick={() => onViewChange("category")}
            className={[
              "px-2.5 py-1 rounded font-semibold transition-all cursor-pointer",
              distributionView === "category"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Category
          </button>
        </div>
      </div>

      {distributionView === "status" ? (
        activeStatuses.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
            No status data available.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="h-36 w-full flex items-center justify-center relative">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie
                    data={activeStatuses}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {activeStatuses.map((item) => (
                      <Cell key={item.status} fill={item.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-foreground leading-none">
                  {totalFeedback}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  Total
                </span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-1.5 mt-3 pt-3 border-t border-border">
              {activeStatuses.slice(0, 5).map((item) => {
                const pct =
                  totalFeedback > 0
                    ? Math.round((item.count / totalFeedback) * 100)
                    : 0;
                return (
                  <div
                    key={item.status}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-muted-foreground font-medium">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-muted-foreground/60 text-[11px] font-normal">
                        {pct}%
                      </span>
                      <span className="text-foreground">{item.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : activeCategories.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
          No categorized feedback yet.
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="h-36 w-full flex items-center justify-center relative">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie
                  data={activeCategories}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                >
                  {activeCategories.map((item) => (
                    <Cell key={item.category} fill={item.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-foreground leading-none">
                {totalCategorized}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                Categorized
              </span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-1.5 mt-3 pt-3 border-t border-border">
            {activeCategories.slice(0, 5).map((item) => {
              const pct =
                totalCategorized > 0
                  ? Math.round((item.count / totalCategorized) * 100)
                  : 0;
              return (
                <div
                  key={item.category}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-muted-foreground font-medium">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-muted-foreground/60 text-[11px] font-normal">
                      {pct}%
                    </span>
                    <span className="text-foreground">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
