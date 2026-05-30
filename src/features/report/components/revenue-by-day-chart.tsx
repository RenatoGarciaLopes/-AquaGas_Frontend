"use client";

import { useMemo } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "@/shared/lib/formatters";

import type { SalesReportItem } from "@/features/report/types";
import { buildDailyRevenue } from "@/features/report/lib/aggregations";

type Props = {
  items: SalesReportItem[];
  start: string;
  end: string;
};

const compactBRL = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function RevenueByDayChart({ end, items, start }: Props) {
  const data = useMemo(
    () => buildDailyRevenue(items, start, end),
    [items, start, end],
  );

  const hasAny = data.some((d) => d.total > 0);

  if (!hasAny) {
    return (
      <div className="text-muted-foreground flex h-72 items-center justify-center text-sm">
        Sem vendas finalizadas no período.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => compactBRL.format(v)}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ className: "fill-muted/30" }}
            contentStyle={{
              backgroundColor: "var(--color-card, #fff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === "spot" ? "Avulsa" : "Contrato",
            ]}
            labelFormatter={(label) => `Dia ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", paddingTop: 4 }}
            formatter={(v) => (v === "spot" ? "Avulsa" : "Contrato")}
          />
          <Bar
            dataKey="spot"
            stackId="rev"
            fill="#00abea"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="contract"
            stackId="rev"
            fill="#0b1e38"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
