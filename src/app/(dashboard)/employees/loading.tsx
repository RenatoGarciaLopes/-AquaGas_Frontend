const ROWS = Array.from({ length: 8 }, (_, i) => i);
const COLS = [
  "Nome",
  "CPF",
  "Telefone",
  "Email",
  "Cargo",
  "Status",
  "Criado em",
  "Ações",
];

export default function EmployeesLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-9 w-48 animate-pulse rounded-lg" />
          <div className="bg-muted h-4 w-72 max-w-full animate-pulse rounded" />
        </div>
        <div className="bg-muted h-10 w-40 animate-pulse rounded-lg" />
      </div>

      {/* search skeleton */}
      <div className="bg-muted h-10 w-full max-w-sm animate-pulse rounded-lg" />

      {/* table skeleton */}
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
              {ROWS.map((r) => (
                <tr key={r}>
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
    </div>
  );
}
