import { Card } from "@/components/ui/card";

export function FeedbackTableLoading() {
  return (
    <div>
      {/* Filter bar skeleton */}
      <div className="mb-5 flex flex-col gap-3">
        {/* Saved views row */}
        <div className="flex items-center gap-1.5 pb-1 overflow-x-auto">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80">
            <div className="h-6 w-12 bg-muted rounded animate-pulse" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-6 w-20 bg-muted/60 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-8 w-16 bg-card border border-border rounded-lg animate-pulse shrink-0" />
          <div className="h-9 flex-1 min-w-[180px] bg-card border border-border rounded-lg animate-pulse" />
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <div className="h-9 w-20 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-card border border-border rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Select all bar skeleton */}
      <div className="h-9 w-full rounded-lg bg-muted/30 border border-border animate-pulse mb-3" />

      {/* Feedback rows skeleton */}
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

export function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Feedback volume chart skeleton */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="h-3.5 w-56 bg-muted rounded animate-pulse mb-4" />
        <div className="h-[200px] w-full rounded-lg bg-muted/20 border border-border/40 animate-pulse flex items-end justify-between px-6 pb-4 pt-10 gap-2">
          {[40, 65, 30, 85, 45, 95, 60, 75, 50, 90, 60, 80].map((h, i) => (
            <div
              key={i}
              className="w-full bg-muted/40 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Status breakdown donut skeleton */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="h-3.5 w-36 bg-muted rounded animate-pulse mb-4" />
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full border-8 border-muted/40 animate-pulse shrink-0" />
            <div className="flex flex-col gap-2.5 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions by day of week skeleton */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="h-3.5 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-[140px] w-full rounded-lg bg-muted/20 border border-border/40 animate-pulse flex items-end justify-between px-6 pb-2 gap-3">
            {[35, 60, 80, 50, 70, 90, 40].map((h, i) => (
              <div
                key={i}
                className="w-8 bg-muted/40 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top pages skeleton */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="h-3.5 w-52 bg-muted rounded animate-pulse mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-4 bg-muted rounded animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmbedLoading() {
  return (
    <div className="xl:max-w-4/5 2xl:max-w-3/5 space-y-4">
      {/* Embed script card skeleton */}
      <Card>
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        <div className="h-3.5 w-72 bg-muted rounded animate-pulse" />
        <div className="bg-background border border-border rounded-lg px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
          <div className="h-8 w-20 bg-muted rounded-md animate-pulse shrink-0" />
        </div>
        <div className="h-3 w-64 bg-muted rounded animate-pulse mt-2" />
      </Card>

      {/* Widget preview card skeleton */}
      <Card>
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-3.5 w-64 bg-muted rounded animate-pulse" />
        <div className="bg-background border border-border rounded-[10px] relative overflow-hidden flex items-center justify-center h-[240px]">
          <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
          <div className="absolute bottom-4 right-4 h-10 w-28 rounded-3xl bg-muted animate-pulse" />
        </div>
      </Card>
    </div>
  );
}

export function IntegrationsLoading() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-64 bg-muted rounded animate-pulse mt-1.5" />
        </div>
        <div className="h-8 w-28 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Payload info skeleton */}
      <div className="bg-card border border-border rounded-xl px-4 py-3.5">
        <div className="h-3 w-28 bg-muted rounded animate-pulse mb-3" />
        <div className="h-28 w-full bg-background border border-border rounded-lg animate-pulse mb-2" />
        <div className="h-3 w-80 bg-muted rounded animate-pulse" />
      </div>

      {/* Webhook rows skeleton */}
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-56 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-6 w-16 rounded bg-muted animate-pulse" />
              <div className="w-7 h-7 rounded-md bg-muted animate-pulse" />
              <div className="w-7 h-7 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsLoading() {
  return (
    <div className="xl:max-w-4/5 2xl:max-w-3/5">
      <Card>
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="flex flex-col gap-5">
          {/* Accent color skeleton */}
          <div>
            <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2.5" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Position skeleton */}
          <div>
            <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2.5" />
            <div className="flex gap-2">
              <div className="h-9 w-28 rounded-[7px] bg-muted animate-pulse" />
              <div className="h-9 w-28 rounded-[7px] bg-muted animate-pulse" />
            </div>
          </div>

          {/* Label skeleton */}
          <div>
            <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2.5" />
            <div className="h-9 w-full rounded-lg bg-background border border-border animate-pulse" />
          </div>

          {/* Launcher display mode skeleton */}
          <div>
            <div className="h-3 w-36 bg-muted rounded animate-pulse mb-2.5" />
            <div className="flex gap-2">
              <div className="h-9 w-28 rounded-[7px] bg-muted animate-pulse" />
              <div className="h-9 w-24 rounded-[7px] bg-muted animate-pulse" />
            </div>
          </div>

          {/* Allowed origin skeleton */}
          <div>
            <div className="h-3 w-28 bg-muted rounded animate-pulse mb-2.5" />
            <div className="h-9 w-full rounded-lg bg-background border border-border animate-pulse" />
          </div>

          {/* Features section skeleton */}
          <div className="border-t border-border pt-4 space-y-4">
            <div className="h-4 w-32 bg-muted rounded animate-pulse mb-3" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-72 bg-muted rounded animate-pulse" />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-56 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Save button skeleton */}
          <div className="flex justify-end pt-2">
            <div className="h-9 w-28 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </Card>
    </div>
  );
}

// Lowercase exports to match declared signatures
export const feedbackTableLoading = FeedbackTableLoading;
export const analyticsLoading = AnalyticsLoading;
export const embedLoading = EmbedLoading;
export const integrationsLoading = IntegrationsLoading;
export const settingsLoading = SettingsLoading;
