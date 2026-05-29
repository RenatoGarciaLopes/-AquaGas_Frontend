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

import type { StockMovementItem } from "@/features/report/types";
import { buildStockFlow } from "@/features/report/lib/aggregations";

type Props = {
  items: StockMovementItem[];
  start: string;
  end: string;
};

export function StockFlowChart({ end, items, start }: Props) {
  const data = useMemo(
    () => buildStockFlow(items, start, end),
    [items, start, end],
  );

  const hasAny = data.some((d) => d.entries + d.exits > 0);
  if (!hasAny) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        Sem movimentações no período.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
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
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={36}
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
              `${Number(value)} un`,
              name === "entries" ? "Entradas" : "Saídas",
            ]}
            labelFormatter={(label) => `Dia ${label}`}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", paddingTop: 4 }}
            formatter={(v) => (v === "entries" ? "Entradas" : "Saídas")}
          />
          <Bar dataKey="entries" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="exits" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
