"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import { PlanStatusBadge } from "@/features/plan/components/plan-status-badge";
import { PlanCycleBadge } from "@/features/plan/components/plan-cycle-badge";
import type { PlansQuery, PlanResponse, PaginatedPlans } from "@/features/plan/types";

type PlansTableProps = {
  initialData: PaginatedPlans;
  query: PlansQuery;
};

export function PlansTable({ initialData, query }: PlansTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateUrl(updates: Record<string, null | number | string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const columns = useMemo<ColumnDef<PlanResponse>[]>(
    () => [
      {
        accessorKey: "customerName",
        cell: ({ row }) => (
          <Link
            href={`/plans/${row.original.id}`}
            className="text-foreground font-medium hover:underline"
          >
            {row.original.customerName}
          </Link>
        ),
        enableSorting: true,
        header: "Cliente",
        id: "customerName",
      },
      {
        accessorKey: "cycle",
        cell: ({ row }) => <PlanCycleBadge cycle={row.original.cycle} />,
        enableSorting: false,
        header: "Ciclo",
        id: "cycle",
      },
      {
        accessorKey: "status",
        cell: ({ row }) => <PlanStatusBadge status={row.original.status} />,
        enableSorting: true,
        header: "Status",
        id: "status",
      },
      {
        accessorKey: "total",
        cell: ({ getValue }) => (
          <span className="text-foreground font-mono">
            {formatCurrency(getValue<number>())}
          </span>
        ),
        enableSorting: true,
        header: "Total",
        id: "total",
      },
      {
        accessorKey: "startDate",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatDate(getValue<string>())}
          </span>
        ),
        enableSorting: true,
        header: "Início",
        id: "startDate",
      },
      {
        accessorKey: "endDate",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatDate(getValue<string>())}
          </span>
        ),
        enableSorting: true,
        header: "Fim",
        id: "endDate",
      },
      {
        cell: ({ row }) => (
          <div className="text-right">
            <Link
              href={`/plans/${row.original.id}`}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition"
            >
              <Icon icon={Icons.eye} aria-hidden className="h-4 w-4" />
              <span className="sr-only">Ver detalhes</span>
            </Link>
          </div>
        ),
        enableSorting: false,
        header: () => <span className="sr-only">Ações</span>,
        id: "actions",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={initialData.data}
      sort={query.sort}
      onSortChange={(sort) =>
        updateUrl({ pageNumber: 1, ...(sort ? { sort } : { sort: "" }) })
      }
      pagination={{
        hasNextPage: initialData.hasNextPage,
        hasPreviousPage: initialData.hasPreviousPage,
        onPageChange: (page) => updateUrl({ pageNumber: page }),
        pageNumber: initialData.pageNumber,
        pageSize: initialData.pageSize,
        totalCount: initialData.totalCount,
        totalPages: initialData.totalPages,
      }}
      emptyState={
        <EmptyState
          title="Nenhum plano encontrado"
          description="Ajuste os filtros ou cadastre o primeiro plano."
          action={
            <Link
              href="/plans/new"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
              Novo plano
            </Link>
          }
        />
      }
    />
  );
}
