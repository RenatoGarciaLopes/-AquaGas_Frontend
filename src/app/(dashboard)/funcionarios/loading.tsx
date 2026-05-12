const skeletonRows = Array.from({ length: 8 }, (_, index) => index);

export default function FuncionariosLoading() {
  return (
    <main className="min-h-screen space-y-6 bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="h-9 w-56 animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-xl bg-white/10" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="h-12 max-w-xl animate-pulse rounded-xl bg-white/10" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                {[
                  "Nome",
                  "CPF",
                  "Telefone",
                  "Email",
                  "Status",
                  "Criado em",
                  "Ações",
                ].map((column) => (
                  <th key={column} className="px-4 py-3 text-left">
                    <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {skeletonRows.map((row) => (
                <tr key={row}>
                  {Array.from({ length: 7 }, (_, index) => (
                    <td key={index} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
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
