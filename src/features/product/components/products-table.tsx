"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import { RowActions } from "@/features/product/components/row-actions";
import { ProductStockCell } from "@/features/product/components/product-stock-cell";
import { ProductTypeBadge } from "@/features/product/components/product-type-badge";
import { ProductStatusBadge } from "@/features/product/components/product-status-badge";
import type {
  ProductsQuery,
  ProductResponse,
  PaginatedProducts,
} from "@/features/product/types";

type ProductsTableProps = {
  canManage: boolean;
  initialData: PaginatedProducts;
  query: ProductsQuery;
};

export function ProductsTable({
  canManage,
  initialData,
  query,
}: ProductsTableProps) {
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

  const columns = useMemo<ColumnDef<ProductResponse>[]>(
    () => [
      {
        accessorKey: "name",
        cell: ({ getValue }) => (
          <span className="text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
        enableSorting: true,
        header: "Nome",
        id: "name",
      },
      {
        accessorKey: "type",
        cell: ({ row }) => <ProductTypeBadge type={row.original.type} />,
        enableSorting: false,
        header: "Tipo",
        id: "type",
      },
      {
        accessorKey: "price",
        cell: ({ getValue }) => (
          <span className="text-foreground">
            {formatCurrency(getValue<number>())}
          </span>
        ),
        enableSorting: true,
        header: "Preço",
        id: "price",
      },
      {
        accessorKey: "quantity",
        cell: ({ getValue }) => (
          <ProductStockCell quantity={getValue<number>()} />
        ),
        enableSorting: true,
        header: "Estoque",
        id: "quantity",
      },
      {
        cell: () => <ProductStatusBadge />,
        enableSorting: false,
        header: "Status",
        id: "status",
      },
      {
        cell: ({ row }) => (
          <div className="text-right">
            <RowActions canManage={canManage} product={row.original} />
          </div>
        ),
        enableSorting: false,
        header: () => <span className="sr-only">Ações</span>,
        id: "actions",
      },
    ],
    [canManage],
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
          title="Nenhum produto encontrado"
          description="Ajuste os filtros ou cadastre o primeiro produto."
          action={
            canManage ? (
              <Link
                href="/products/new"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
              >
                <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
                Novo produto
              </Link>
            ) : null
          }
        />
      }
    />
  );
}
