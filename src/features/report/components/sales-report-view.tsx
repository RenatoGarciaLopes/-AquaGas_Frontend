"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { CsvColumn } from "@/shared/lib/csv";
import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import { ExportCsvButton } from "@/features/report/components/export-csv-button";
import type {
  SalesItemType,
  SalesReportItem,
  SalesItemStatus,
} from "@/features/report/types";

type Props = {
  items: SalesReportItem[];
  status: SalesItemStatus | undefined;
  type: SalesItemType | undefined;
  start: string;
  end: string;
};

const STATUS_LABEL: Record<SalesItemStatus, string> = {
  FINISHED: "Finalizada",
  CANCELLED: "Cancelada",
};

const TYPE_LABEL: Record<SalesItemType, string> = {
  SALE: "Avulsa",
  PLAN: "Contrato",
};

function StatusBadge({ status }: { status: SalesItemStatus }) {
  return status === "CANCELLED" ? (
    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
      {STATUS_LABEL[status]}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      {STATUS_LABEL[status]}
    </span>
  );
}

function TypeBadge({ type }: { type: SalesItemType }) {
  return type === "PLAN" ? (
    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
      {TYPE_LABEL[type]}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700">
      {TYPE_LABEL[type]}
    </span>
  );
}

function summarizeProducts(item: SalesReportItem): string {
  if (item.items.length === 0) return "—";
  const first = item.items[0]!;
  const extra = item.items.length - 1;
  return extra > 0
    ? `${first.productName} +${extra}`
    : `${first.productName} (${first.quantity})`;
}

export function SalesReportView({
  end,
  items: allItems,
  start,
  status,
  type,
}: Props) {
  const items = useMemo(() => {
    return allItems.filter((item) => {
      if (status && item.status !== status) return false;
      if (type && item.type !== type) return false;
      return true;
    });
  }, [allItems, status, type]);

  const columns = useMemo<ColumnDef<SalesReportItem>[]>(
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
        id: "customer",
        header: "Cliente",
        accessorFn: (row) => row.customer?.name ?? "—",
        cell: ({ getValue }) => (
          <span className="text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "employee",
        header: "Vendedor",
        accessorFn: (row) => row.employee.name,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "products",
        header: "Itens",
        accessorFn: (row) => summarizeProducts(row),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "type",
        header: "Tipo",
        accessorFn: (row) => row.type,
        cell: ({ getValue }) => <TypeBadge type={getValue<SalesItemType>()} />,
      },
      {
        id: "total",
        header: "Valor",
        accessorFn: (row) => row.total,
        cell: ({ getValue }) => (
          <span className="text-foreground font-semibold whitespace-nowrap tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        cell: ({ getValue }) => (
          <StatusBadge status={getValue<SalesItemStatus>()} />
        ),
      },
    ],
    [],
  );

  const csvColumns: CsvColumn<SalesReportItem>[] = [
    { header: "Data", accessor: (r) => formatDate(r.date) },
    { header: "Cliente", accessor: (r) => r.customer?.name ?? "" },
    { header: "Vendedor", accessor: (r) => r.employee.name },
    { header: "Itens", accessor: (r) => summarizeProducts(r) },
    { header: "Tipo", accessor: (r) => TYPE_LABEL[r.type] },
    { header: "Valor", accessor: (r) => formatCurrency(r.total) },
    { header: "Status", accessor: (r) => STATUS_LABEL[r.status] },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <ExportCsvButton
          rows={items}
          columns={csvColumns}
          filename={`vendas_${start}_a_${end}.csv`}
        />
      </div>
      <DataTable
        columns={columns}
        data={items}
        emptyState={
          <EmptyState
            title="Nenhuma venda encontrada"
            description="Ajuste o período ou os filtros aplicados."
          />
        }
      />
    </div>
  );
}
