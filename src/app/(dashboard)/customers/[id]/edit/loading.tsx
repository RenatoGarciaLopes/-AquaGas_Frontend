const ROWS = Array.from({ length: 7 }, (_, i) => i);

export default function EditCustomerLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <div className="bg-muted h-9 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-4 w-64 animate-pulse rounded" />
      </div>

      <div className="bg-muted h-5 w-36 animate-pulse rounded" />

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
          <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
        </aside>

        <section className="space-y-6">
          <div className="space-y-2">
            <div className="bg-muted h-7 w-44 animate-pulse rounded" />
            <div className="bg-muted h-4 w-80 max-w-full animate-pulse rounded" />
          </div>

          <div className="space-y-5">
            {ROWS.map((row) => (
              <div
                key={row}
                className="bg-muted h-16 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
