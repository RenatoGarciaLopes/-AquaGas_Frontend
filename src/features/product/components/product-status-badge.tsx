// O backend só retorna produtos ativos no GET /api/products,
// portanto a coluna "Status" da listagem é sempre "Ativo".
// Mantemos a prop opcional para suportar telas futuras que exponham produtos inativos.
export function ProductStatusBadge({
  isActive = true,
}: {
  isActive?: boolean;
}) {
  if (isActive) {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
        Ativo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
      Inativo
    </span>
  );
}
