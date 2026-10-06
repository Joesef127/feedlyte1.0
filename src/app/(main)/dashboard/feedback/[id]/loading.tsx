import { Card } from "@/components/ui/card";

export default function FeedbackDetailLoading() {
  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* Back button skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      </div>

      <div className="max-w-full xl:max-w-3/4 flex flex-col gap-5">
        {/* Header skeleton */}
        <Card>
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-muted animate-pulse shrink-0 mt-1" />
              <div>
                <div className="h-5 w-36 bg-muted rounded animate-pulse" />
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="h-8 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
          </div>

          {/* Badges skeleton (category & rating) */}
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
            <div className="h-6 w-28 rounded-full bg-muted animate-pulse" />
          </div>

          {/* Message box skeleton */}
          <div className="bg-background border border-border rounded-xl px-3 sm:px-5 py-4 space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </Card>

        {/* Status Selector skeleton */}
        <Card>
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
            <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="h-7 w-16 rounded-lg bg-muted animate-pulse" />
            <div className="h-7 w-20 rounded-lg bg-muted animate-pulse" />
            <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="h-7 w-20 rounded-lg bg-muted animate-pulse" />
            <div className="h-7 w-18 rounded-lg bg-muted animate-pulse" />
          </div>
        </Card>

        {/* Resolution Metrics skeleton */}
        <Card>
          <div className="h-3.5 w-44 bg-muted rounded animate-pulse mb-1" />
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-background rounded-lg border border-border space-y-2">
              <div className="h-2.5 w-24 bg-muted rounded animate-pulse" />
              <div className="h-5 w-28 bg-muted rounded animate-pulse" />
            </div>
            <div className="p-3 bg-background rounded-lg border border-border space-y-2">
              <div className="h-2.5 w-28 bg-muted rounded animate-pulse" />
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </Card>

        {/* Tags & Assignee skeleton */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="h-3.5 w-16 bg-muted rounded animate-pulse mb-3" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="h-6 w-16 rounded-md bg-muted animate-pulse" />
                <div className="h-6 w-20 rounded-md bg-muted animate-pulse" />
                <div className="h-6 w-20 rounded-md border border-dashed border-border bg-muted/40 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="h-3.5 w-20 bg-muted rounded animate-pulse mb-3" />
              <div className="p-2 bg-background border border-border rounded-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </Card>

        {/* Internal Notes skeleton */}
        <Card>
          <div className="space-y-1 mb-1">
            <div className="h-3.5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="relative">
            <div className="h-20 w-full bg-background border border-border rounded-xl p-3" />
            <div className="absolute right-2.5 bottom-2.5 h-7 w-20 bg-muted rounded-md animate-pulse" />
          </div>
          <div className="p-3 bg-background rounded-lg border border-border flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-muted animate-pulse shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-3.5 w-3/4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </Card>

        {/* Submission Details skeleton */}
        <Card>
          <div className="h-3.5 w-36 bg-muted rounded animate-pulse mb-1" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <div className="w-4 h-4 rounded bg-muted animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <div className="w-4 h-4 rounded bg-muted animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-12 bg-muted rounded animate-pulse" />
                <div className="h-4 w-36 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border sm:col-span-2">
              <div className="w-4 h-4 rounded bg-muted animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-3/5 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <div className="w-4 h-4 rounded bg-muted animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
              <div className="w-4 h-4 rounded bg-muted animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </Card>

        {/* Project Context skeleton */}
        <Card>
          <div className="h-3.5 w-16 bg-muted rounded animate-pulse mb-1" />
          <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-3 w-40 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 rounded bg-muted animate-pulse shrink-0" />
          </div>
        </Card>
      </div>
    </div>
  );
}