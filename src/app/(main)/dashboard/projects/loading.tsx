export default function ProjectsLoading() {
  return (
    <div className="flex-1 px-4 sm:px-9 py-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-7">
        <div>
          <div className="h-7 w-32 bg-card border border-border rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-24 bg-card border border-border rounded-md animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-card border border-border rounded-lg animate-pulse" />
      </div>

      <div className="h-10 w-full max-w-sm bg-card border border-border rounded-lg animate-pulse mb-7" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-card border border-border animate-pulse p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
