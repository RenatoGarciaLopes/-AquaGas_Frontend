export default function CustomerDetailLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* back link */}
      <div className="bg-muted h-5 w-40 animate-pulse rounded" />

      {/* EntityHeader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-muted h-12 w-12 animate-pulse rounded-xl" />
          <div className="space-y-2">
            <div className="bg-muted h-8 w-52 animate-pulse rounded-lg" />
            <div className="bg-muted h-4 w-36 animate-pulse rounded" />
            <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
            <div className="bg-muted h-3.5 w-64 animate-pulse rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-muted h-10 w-24 animate-pulse rounded-lg" />
          <div className="bg-muted h-10 w-28 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Hero StatCards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border-border bg-card rounded-xl border p-4">
            <div className="bg-muted mb-2 h-3 w-24 animate-pulse rounded" />
            <div className="bg-muted h-7 w-36 animate-pulse rounded" />
            <div className="bg-muted mt-1.5 h-3 w-28 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* InfoCards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card 1 — Identificação */}
        <div className="border-border bg-card rounded-xl border p-6">
          <div className="bg-muted mb-4 h-5 w-28 animate-pulse rounded" />
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 — Contato */}
        <div className="border-border bg-card rounded-xl border p-6">
          <div className="bg-muted mb-4 h-5 w-20 animate-pulse rounded" />
          <div className="space-y-4">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-40 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — Endereço (full width) */}
        <div className="border-border bg-card rounded-xl border p-6 lg:col-span-2">
          <div className="bg-muted mb-4 h-5 w-24 animate-pulse rounded" />
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-48 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
