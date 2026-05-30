import Link from "next/link";
import type { IconifyIcon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { isGerente, type UserRole } from "@/shared/auth/roles";
import { StatCard, type StatCardAccent } from "@/shared/ui/stat-card";

import type { HomeIndicators } from "../types";

type Indicator = {
  accent: StatCardAccent;
  hint?: string;
  href: string;
  icon: IconifyIcon;
  label: string;
  managerOnly?: boolean;
  value: number | string;
};

function buildIndicators(i: HomeIndicators): Indicator[] {
  return [
    {
      accent: "default",
      href: "#proximas-entregas",
      icon: Icons.delivery,
      label: "Entregas hoje",
      value: i.deliveriesToday,
    },
    {
      accent: i.deliveriesOverdue > 0 ? "danger" : "default",
      href: "#proximas-entregas",
      icon: Icons.alertTriangle,
      label: "Entregas atrasadas",
      value: i.deliveriesOverdue,
    },
    {
      accent: i.receivablesOverdue > 0 ? "warning" : "default",
      href: "#recebiveis",
      icon: Icons.wallet,
      label: "Recebíveis a confirmar",
      value: i.receivablesPending,
    },
    {
      accent: i.lowStock > 0 ? "warning" : "default",
      href: "/products",
      icon: Icons.package,
      label: "Estoque baixo",
      value: i.lowStock,
    },
    {
      accent: "success",
      hint: `${formatCurrency(i.salesTodayTotal)} faturados`,
      href: "/sales",
      icon: Icons.shoppingCart,
      label: "Vendas hoje",
      value: i.salesTodayCount,
    },
    {
      accent: "default",
      href: "/plans?status=Active",
      icon: Icons.fileText,
      label: "Planos ativos",
      value: i.activePlans,
    },
    // Multas: redundante como indicador (o dashboard do gestor e o banner de
    // atenção já cobrem). Mantém o grid em 6 itens — sem card órfão.
  ];
}

type HomeIndicatorsGridProps = {
  indicators: HomeIndicators;
  role: UserRole | null;
};

export function HomeIndicatorsGrid({
  indicators,
  role,
}: HomeIndicatorsGridProps) {
  const manager = isGerente(role);
  const items = buildIndicators(indicators).filter(
    (item) => !item.managerOnly || manager,
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-xl transition focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
        >
          <StatCard
            accent={item.accent}
            icon={item.icon}
            label={item.label}
            value={item.value}
            hint={item.hint}
            className="h-full transition hover:border-cyan-400/40 hover:shadow-sm"
          />
        </Link>
      ))}
    </div>
  );
}
