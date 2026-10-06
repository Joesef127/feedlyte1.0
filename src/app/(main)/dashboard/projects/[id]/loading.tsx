import { Card } from "@/components/ui/card";

export default function ProjectDetailLoading() {
  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-4">
          <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <div className="h-7 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse mt-2" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="w-full justify-between">
            <div className="flex items-center justify-between gap-2.5">
              <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
              <div className="w-4 h-4 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-7 w-12 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>

      {/* Project tabs skeleton */}
      <div className="flex gap-4 sm:gap-6 mb-5 border-b border-sidebar-border pb-2.5 overflow-x-hidden">
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-5 w-28 bg-muted rounded animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-5 flex flex-col gap-3">
        {/* Saved views row */}
        <div className="flex items-center gap-1.5 pb-1">
          <div className="h-8 w-72 rounded-xl bg-card border border-border animate-pulse" />
        </div>

        {/* Filter controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-8 w-16 bg-card border border-border rounded-lg animate-pulse shrink-0" />
          <div className="h-9 flex-1 min-w-[180px] bg-card border border-border rounded-lg animate-pulse" />
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <div className="h-9 w-24 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-9 w-28 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-9 w-28 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-card border border-border rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Select all bar skeleton */}
      <div className="h-9 w-full rounded-lg bg-muted/30 border border-border animate-pulse mb-3" />

      {/* Feedback list items skeleton */}
      <div className="flex flex-col gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-card border border-border p-4 flex items-center justify-between gap-4 animate-pulse"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-5 h-5 rounded bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
