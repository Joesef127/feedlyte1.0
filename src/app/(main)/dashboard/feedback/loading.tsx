export default function FeedbackLoading() {
  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* summary skeleton */}
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-7 gap-4">
        <div>
          <div className="h-7 w-36 bg-card border border-border rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-48 bg-card border border-border rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-card border border-border rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-card border border-border rounded-lg animate-pulse" />
        </div>
      </div> */}

      {/* tabs skeleton */}
      {/* <div className="h-10 w-full bg-card border border-border rounded-xl animate-pulse mb-6" /> */}

      {/* stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 w-full bg-card border border-border rounded-xl animate-pulse p-4 flex flex-col gap-3"
          >
            <div className="h-24 w-full bg-muted rounded-lg animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-3 w-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* filter skeleton */}
      <div className="h-10 w-full bg-card border border-border rounded-xl animate-pulse mb-6" />

      {/* table skeleton */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-card border border-border animate-pulse p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                <div className="h-3 w-64 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
