"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { formatCpf, formatDate, formatPhone } from "@/shared/lib/formatters";

import { EmptyState } from "@/shared/ui/empty-state";

import { RowActions } from "@/features/funcionario/components/row-actions";
import type {
  FuncionariosQuery,
  PaginatedFuncionarios,
} from "@/features/funcionario/types";

type FuncionariosTableProps = {
  canManage: boolean;
  initialData: PaginatedFuncionarios;
  query: FuncionariosQuery;
};

type SortableColumn = "cpf" | "createdAt" | "email" | "name" | "status";

const columns: Array<{ key: SortableColumn; label: string }> = [
  { key: "name", label: "Nome" },
  { key: "cpf", label: "CPF" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Criado em" },
];

function statusClass(status: string) {
  return status.toUpperCase() === "ATIVO"
    ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
    : "border-white/10 bg-white/10 text-slate-300";
}

function parseSort(sort?: string) {
  const [field, direction] = sort?.split(":") ?? [];

  return {
    direction: direction === "desc" ? "desc" : "asc",
    field,
  };
}

export function FuncionariosTable({
  canManage,
  initialData,
  query,
}: FuncionariosTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = parseSort(query.sort);

  function updateUrl(updates: Record<string, null | number | string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const nextQueryString = params.toString();
    router.push(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, {
      scroll: false,
    });
  }

  function handleSort(column: SortableColumn) {
    const nextDirection =
      sort.field === column && sort.direction === "asc" ? "desc" : "asc";

    updateUrl({
      pageNumber: 1,
      sort: `${column}:${nextDirection}`,
    });
  }

  function handlePageChange(pageNumber: number) {
    updateUrl({ pageNumber });
  }

  if (initialData.data.length === 0) {
    return (
      <EmptyState
        title="Nenhum funcionário encontrado"
        description="Ajuste os filtros ou crie o primeiro funcionário para começar."
        action={
          canManage ? (
            <Link
              href="/funcionarios/novo"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--aquagas-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--aquagas-primary-hover)] focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Criar funcionário
            </Link>
          ) : null
        }
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs text-slate-300 uppercase">
              <tr>
                {columns.slice(0, 2).map((column) => (
                  <th key={column.key} scope="col" className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1 font-semibold transition hover:text-white focus:ring-2 focus:ring-cyan-300/40 focus:outline-none"
                    >
                      {column.label}
                      <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </th>
                ))}
                <th scope="col" className="px-4 py-3">
                  Telefone
                </th>
                {columns.slice(2).map((column) => (
                  <th key={column.key} scope="col" className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1 font-semibold transition hover:text-white focus:ring-2 focus:ring-cyan-300/40 focus:outline-none"
                    >
                      {column.label}
                      <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {initialData.data.map((funcionario) => (
                <tr
                  key={funcionario.id}
                  className="text-slate-100 transition hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4 font-medium">{funcionario.name}</td>
                  <td className="px-4 py-4 text-slate-200">
                    {formatCpf(funcionario.cpf)}
                  </td>
                  <td className="px-4 py-4 text-slate-200">
                    {formatPhone(funcionario.phone)}
                  </td>
                  <td className="px-4 py-4 text-slate-200">
                    {funcionario.email || "Sem email"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                        funcionario.status,
                      )}`}
                    >
                      {funcionario.status.toUpperCase() === "ATIVO"
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-200">
                    {formatDate(funcionario.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <RowActions
                      canManage={canManage}
                      funcionario={funcionario}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {initialData.totalCount} resultado(s) · Página{" "}
          {initialData.pageNumber} de {initialData.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!initialData.hasPreviousPage}
            onClick={() => handlePageChange(Math.max(1, query.pageNumber - 1))}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Página anterior
          </button>
          <button
            type="button"
            disabled={!initialData.hasNextPage}
            onClick={() => handlePageChange(query.pageNumber + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima página
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
