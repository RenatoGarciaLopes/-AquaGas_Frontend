"use client";

import {
  Pie,
  Cell,
  Legend,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "@/shared/lib/formatters";

import type { SalesSummary } from "@/features/report/types";

type Props = { summary: SalesSummary };

const COLORS = ["#00abea", "#0b1e38"];

export function SalesMixChart({ summary }: Props) {
  const data = [
    { name: "Avulsa", value: summary.totalSpotSales },
    { name: "Contrato", value: summary.totalContractSales },
  ];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
        Sem receita no período.
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
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card, #fff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
