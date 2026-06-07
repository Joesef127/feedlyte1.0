"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";

export function DashboardScreen() {
  return (
    <ErrorBoundary context="dashboard-page">
      <div className="flex-1 px-9 py-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-7">
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-[-0.03em] m-0">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1 m-0">
              Dashboard Page
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
