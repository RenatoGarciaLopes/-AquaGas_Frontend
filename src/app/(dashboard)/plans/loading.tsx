const ROWS = Array.from({ length: 8 }, (_, i) => i);
const COLS = ["Cliente", "Ciclo", "Status", "Total", "Início", "Fim"];

export default function PlansLoading() {
  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-9 w-32 animate-pulse rounded-lg" />
          <div className="bg-muted h-4 w-80 max-w-full animate-pulse rounded" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="bg-muted h-10 w-full max-w-sm animate-pulse rounded-lg" />
        <div className="bg-muted h-10 w-full animate-pulse rounded-lg sm:w-40" />
        <div className="bg-muted h-10 w-full animate-pulse rounded-lg sm:w-40" />
      </div>

      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-border bg-muted/40 border-b">
              <tr>
                {COLS.map((col) => (
                  <th key={col} className="px-4 py-3 text-left">
                    <div className="bg-muted h-3.5 w-16 animate-pulse rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {ROWS.map((row) => (
                <tr key={row}>
                  {COLS.map((col) => (
                    <td key={col} className="px-4 py-3.5">
                      <div className="bg-muted h-4 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
