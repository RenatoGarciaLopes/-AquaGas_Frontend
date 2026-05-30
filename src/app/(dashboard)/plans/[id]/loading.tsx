export default function PlanDetailLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="bg-muted h-4 w-32 animate-pulse rounded" />

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="bg-muted h-8 w-56 animate-pulse rounded-lg" />
            <div className="bg-muted h-4 w-40 animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
              <div className="bg-muted h-5 w-20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="border-border bg-card rounded-xl border p-5 shadow-sm"
          >
            <div className="bg-muted mb-2 h-3.5 w-24 animate-pulse rounded" />
            <div className="bg-muted h-7 w-32 animate-pulse rounded" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`border-border bg-card rounded-xl border p-6 shadow-sm ${i >= 2 ? "lg:col-span-2" : ""}`}
          >
            <div className="bg-muted mb-4 h-5 w-32 animate-pulse rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={j} className="bg-muted h-4 animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
