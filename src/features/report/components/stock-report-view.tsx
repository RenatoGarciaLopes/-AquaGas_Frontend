"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { formatDate } from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import type {
  StockMovementItem,
  StockMovementType,
} from "@/features/report/types";

type Props = {
  items: StockMovementItem[];
  productId: string | undefined;
  type: StockMovementType | undefined;
};

function TypeBadge({ type }: { type: StockMovementType }) {
  return type === "Entry" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      Entrada
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
      Saída
    </span>
  );
}

export function StockReportView({ items: allItems, productId, type }: Props) {
  const items = useMemo(() => {
    return allItems.filter((item) => {
      if (productId && item.product.id !== productId) return false;
      if (type && item.type !== type) return false;
      return true;
    });
  }, [allItems, productId, type]);

  const columns = useMemo<ColumnDef<StockMovementItem>[]>(
    () => [
      {
        id: "date",
        header: "Data",
        accessorFn: (row) => row.date,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "product",
        header: "Produto",
        accessorFn: (row) => row.product.name,
        cell: ({ getValue }) => (
          <span className="text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "type",
        header: "Tipo",
        accessorFn: (row) => row.type,
        cell: ({ getValue }) => (
          <TypeBadge type={getValue<StockMovementType>()} />
        ),
      },
      {
        id: "quantity",
        header: "Qtd",
        accessorFn: (row) => row.quantity,
        cell: ({ getValue, row }) => {
          const isEntry = row.original.type === "Entry";
          return (
            <span
              className={`font-semibold whitespace-nowrap tabular-nums ${
                isEntry ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {isEntry ? "+" : "-"}
              {getValue<number>()}
            </span>
          );
        },
      },
      {
        id: "reason",
        header: "Motivo",
        accessorFn: (row) => row.reason,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "employee",
        header: "Responsável",
        accessorFn: (row) => row.employee.name,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      emptyState={
        <EmptyState
          title="Nenhuma movimentação encontrada"
          description="Ajuste o período ou os filtros aplicados."
        />
      }
    />
  );
}
