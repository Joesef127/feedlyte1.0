export default function DashboardLoading() {
  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="h-7 w-48 bg-card border border-border rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-card border border-border rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-card border border-border rounded-lg animate-pulse" />
          <div className="h-9 w-28 bg-card border border-border rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <div className="h-9 w-36 bg-card border border-border rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-card border border-border rounded-lg animate-pulse" />
      </div>

      {/* Stats cards grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between"
          >
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-7 w-12 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Activity and distribution charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-card border border-border animate-pulse" />
        <div className="h-72 rounded-2xl bg-card border border-border animate-pulse" />
      </div>

      {/* Recent feedback & projects skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-card border border-border animate-pulse" />
        <div className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
      </div>
    </div>
  );
}
