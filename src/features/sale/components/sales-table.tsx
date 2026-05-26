"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import type { PaginatedSales, SalesQuery, SaleResponse, SaleStatus } from "@/features/sale/types";

type SalesTableProps = {
  initialData: PaginatedSales;
  query: SalesQuery;
};

function StatusBadge({ status }: { status: SaleStatus }) {
  const canceled = status === "Canceled" || status === 1;
  if (canceled) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-400/15 dark:text-red-400">
        Cancelada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400">
      Finalizada
    </span>
  );
}

export function SalesTable({ initialData, query }: SalesTableProps) {
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

  const columns = useMemo<ColumnDef<SaleResponse>[]>(
    () => [
      {
        accessorKey: "createdAt",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatDate(getValue<string>())}
          </span>
        ),
        enableSorting: true,
        header: "Data",
        id: "createdAt",
      },
      {
        accessorFn: (row) => row.customer?.name ?? "Venda balcão",
        cell: ({ getValue }) => (
          <span className="text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
        enableSorting: false,
        header: "Cliente",
        id: "customer",
      },
      {
        accessorFn: (row) => row.employee.name,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
        enableSorting: false,
        header: "Vendedor",
        id: "employee",
      },
      {
        accessorKey: "status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue<SaleStatus>()} />
        ),
        enableSorting: false,
        header: "Status",
        id: "status",
      },
      {
        accessorKey: "total",
        cell: ({ getValue }) => (
          <span className="text-foreground font-semibold">
            {formatCurrency(getValue<number>())}
          </span>
        ),
        enableSorting: true,
        header: "Total",
        id: "total",
      },
      {
        cell: ({ row }) => (
          <div className="text-right">
            <Link
              href={`/sales/${row.original.id}`}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-semibold transition"
            >
              <Icon icon={Icons.eye} aria-hidden className="h-4 w-4" />
              Ver
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
          title="Nenhuma venda encontrada"
          description="Nenhuma venda corresponde aos filtros aplicados."
          action={
            <Link
              href="/sales/new"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
              Nova venda
            </Link>
          }
        />
      }
    />
  );
}
