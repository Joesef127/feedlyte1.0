"use client";

interface MetricsHeaderProps {
  embedded?: boolean;
  timeframe: 7 | 30 | 90;
  onSelectTimeframe: (timeframe: 7 | 30 | 90) => void;
}

export function MetricsHeader({
  embedded = false,
  timeframe,
  onSelectTimeframe,
}: MetricsHeaderProps) {
  return (
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
            onClick={() => onSelectTimeframe(days)}
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
  );
}
