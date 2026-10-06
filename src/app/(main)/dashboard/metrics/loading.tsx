export default function MetricsLoading() {
  return (
    <div className="flex-1 px-5 sm:px-9 py-8 overflow-y-auto">
      <div className="mb-7">
        <div className="h-7 w-32 bg-card border border-border rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-60 bg-card border border-border rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between"
          >
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-7 w-16 bg-muted rounded animate-pulse" />
            <div className="h-2 w-28 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="h-40 sm:h-64 mb-8 rounded-2xl bg-card border border-border animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-48 sm:h-72 rounded-2xl bg-card border border-border animate-pulse" />
        <div className="h-48 sm:h-72 rounded-2xl bg-card border border-border animate-pulse" />
        <div className="h-48 sm:h-72 rounded-2xl bg-card border border-border animate-pulse" />
      </div>
    </div>
  );
}
