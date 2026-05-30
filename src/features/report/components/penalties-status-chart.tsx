"use client";

import { useMemo } from "react";
import {
  Pie,
  Cell,
  Legend,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "@/shared/lib/formatters";

import type { PenaltyStatus, PenaltyReportItem } from "@/features/report/types";
import { buildPenaltyStatusBreakdown } from "@/features/report/lib/aggregations";

type Props = { items: PenaltyReportItem[] };

const STATUS_LABELS: Record<PenaltyStatus, string> = {
  PENDING_PAYMENT: "Pendente",
  OVERDUE: "Vencida",
  PAID: "Paga",
  WAIVED: "Isenta",
  CANCELED: "Cancelada",
};

const STATUS_COLORS: Record<PenaltyStatus, string> = {
  PENDING_PAYMENT: "#f59e0b",
  OVERDUE: "#ef4444",
  PAID: "#10b981",
  WAIVED: "#64748b",
  CANCELED: "#94a3b8",
};

export function PenaltiesStatusChart({ items }: Props) {
  const data = useMemo(() => {
    return buildPenaltyStatusBreakdown(items)
      .filter((s) => s.count > 0)
      .map((s) => ({
        status: s.status,
        name: STATUS_LABELS[s.status],
        value: s.amount,
        count: s.count,
      }));
  }, [items]);

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        Sem multas no período.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((slice) => (
              <Cell key={slice.status} fill={STATUS_COLORS[slice.status]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card, #fff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
            formatter={(value, _name, entry) => {
              const payload = (
                entry as { payload?: { count?: number; name?: string } }
              )?.payload;
              return [
                `${formatCurrency(Number(value))} · ${payload?.count ?? 0} multa(s)`,
                payload?.name ?? "",
              ];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
