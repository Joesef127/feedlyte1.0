"use client";

import { ChartCard } from "./chart-card";

interface CategoryItem {
  category: string;
  label: string;
  count: number;
  color: string;
}

interface MetricsCategoryCardProps {
  activeCategories: CategoryItem[];
  totalFeedback: number;
}

export function MetricsCategoryCard({
  activeCategories,
  totalFeedback,
}: MetricsCategoryCardProps) {
  return (
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
            const percentage =
              totalFeedback > 0
                ? Math.round((item.count / totalFeedback) * 100)
                : 0;
            return (
              <div key={item.category} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono">
                    {item.count} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </ChartCard>
  );
}
