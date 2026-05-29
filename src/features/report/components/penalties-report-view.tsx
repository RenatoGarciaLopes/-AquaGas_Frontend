"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import type {
  PenaltyType,
  PenaltyStatus,
  PenaltyReportItem,
} from "@/features/report/types";

type Props = {
  items: PenaltyReportItem[];
  status: PenaltyStatus | undefined;
  type: PenaltyType | undefined;
};

const STATUS_LABEL: Record<PenaltyStatus, string> = {
  PENDING_PAYMENT: "Pendente",
  OVERDUE: "Vencida",
  PAID: "Paga",
  WAIVED: "Isenta",
  CANCELED: "Cancelada",
};

const STATUS_STYLES: Record<PenaltyStatus, string> = {
  PENDING_PAYMENT: "border-amber-200 bg-amber-50 text-amber-700",
  OVERDUE: "border-red-200 bg-red-50 text-red-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  WAIVED: "border-slate-200 bg-slate-50 text-slate-600",
  CANCELED: "border-slate-200 bg-slate-50 text-slate-500",
};

const TYPE_LABEL: Record<PenaltyType, string> = {
  DOWNGRADE: "Downgrade",
  EARLY_CANCELLATION: "Cancelamento antecipado",
};

function StatusBadge({ status }: { status: PenaltyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PenaltiesReportView({ items: allItems, status, type }: Props) {
  const items = useMemo(() => {
    return allItems.filter((item) => {
      if (status && item.status !== status) return false;
      if (type && item.type !== type) return false;
      return true;
    });
  }, [allItems, status, type]);

  const columns = useMemo<ColumnDef<PenaltyReportItem>[]>(
    () => [
      {
        id: "dueDate",
        header: "Vencimento",
        accessorFn: (row) => row.dueDate,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {formatDate(getValue<string>())}
          </span>
        ),
      },
      {
        id: "customer",
        header: "Cliente",
        accessorFn: (row) => row.customer.name,
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
          <span className="text-muted-foreground">
            {TYPE_LABEL[getValue<PenaltyType>()]}
          </span>
        ),
      },
      {
        id: "originalValue",
        header: "Valor original",
        accessorFn: (row) => row.financial.originalValue,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground whitespace-nowrap tabular-nums">
            {formatCurrency(getValue<number>())}
          </span>
        ),
      },
      {
        id: "calculatedValue",
        header: "Multa",
        accessorFn: (row) => row.financial.calculatedValue,
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
          <StatusBadge status={getValue<PenaltyStatus>()} />
        ),
      },
      {
        id: "paidAt",
        header: "Pagamento",
        accessorFn: (row) => row.paidAt,
        cell: ({ getValue }) => {
          const value = getValue<string | null>();
          return (
            <span className="text-muted-foreground whitespace-nowrap">
              {value ? formatDate(value) : "—"}
            </span>
          );
        },
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
          title="Nenhuma multa encontrada"
          description="Ajuste o período ou os filtros aplicados."
        />
      }
    />
  );
}
