"use client";

import { ChartCard } from "./chart-card";

interface ProjectVolumeItem {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface MetricsProjectVolumeCardProps {
  projectVolume: ProjectVolumeItem[];
}

export function MetricsProjectVolumeCard({
  projectVolume,
}: MetricsProjectVolumeCardProps) {
  return (
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
                      style={{
                        width: `${percentage}%`,
                        background: proj.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </ChartCard>
  );
}
