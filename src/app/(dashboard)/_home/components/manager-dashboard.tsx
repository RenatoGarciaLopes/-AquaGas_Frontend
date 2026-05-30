import Link from "next/link";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { StatCard } from "@/shared/ui/stat-card";
import { ErrorState } from "@/shared/ui/error-state";

import type { SalesSummary, PenaltySummary } from "@/features/report/types";

import { HomeSection } from "./home-section";
import { PeriodToggle } from "./period-toggle";
import type { HomePeriod } from "../lib/periods";

type ManagerDashboardProps = {
  failed: boolean;
  penalties: PenaltySummary | null;
  period: HomePeriod;
  sales: SalesSummary | null;
};

function SalesMixBar({ summary }: { summary: SalesSummary }) {
  const total = summary.totalSpotSales + summary.totalContractSales;
  if (total <= 0) {
    return (
      <p className="text-muted-foreground text-xs">
        Sem vendas registradas no período.
      </p>
    );
  }

  const spotPct = Math.round((summary.totalSpotSales / total) * 100);
  const contractPct = 100 - spotPct;

  return (
    <div>
      <div className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full">
        <div className="bg-cyan-500" style={{ width: `${spotPct}%` }} />
        <div className="bg-indigo-500" style={{ width: `${contractPct}%` }} />
      </div>
      <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-500" />
          Avulsas {spotPct}% · {formatCurrency(summary.totalSpotSales)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Contratos {contractPct}% ·{" "}
          {formatCurrency(summary.totalContractSales)}
        </span>
      </div>
    </div>
  );
}

export function ManagerDashboard({
  failed,
  penalties,
  period,
  sales,
}: ManagerDashboardProps) {
  return (
    <HomeSection
      title="Visão do gestor"
      icon={Icons.barChart}
      action={<PeriodToggle active={period} />}
    >
      {failed || (!sales && !penalties) ? (
        <ErrorState
          title="Não foi possível carregar os indicadores gerenciais"
          description="Os demais blocos da Home continuam disponíveis."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sales ? (
              <>
                <Link href="/reports/sales" className="rounded-xl">
                  <StatCard
                    label="Faturamento"
                    value={formatCurrency(sales.totalRevenue)}
                    hint={`${sales.totalSales} venda(s)`}
                    icon={Icons.wallet}
                    accent="success"
                    className="h-full hover:border-cyan-400/40"
                  />
                </Link>
                <StatCard
                  label="Ticket médio"
                  value={formatCurrency(sales.averageTicket)}
                  icon={Icons.shoppingCart}
                />
                <StatCard
                  label="Vendas canceladas"
                  value={sales.cancelledSales}
                  icon={Icons.x}
                  accent={sales.cancelledSales > 0 ? "danger" : "default"}
                />
              </>
            ) : null}

            {penalties ? (
              <Link href="/reports/penalties" className="rounded-xl">
                <StatCard
                  label="Multas pendentes"
                  value={formatCurrency(penalties.pendingAmount)}
                  hint={
                    penalties.overdueAmount > 0
                      ? `${formatCurrency(penalties.overdueAmount)} em atraso`
                      : undefined
                  }
                  icon={Icons.billList}
                  accent={penalties.overdueAmount > 0 ? "danger" : "warning"}
                  className="h-full hover:border-cyan-400/40"
                />
              </Link>
            ) : null}
          </div>

          {sales ? (
            <div className="border-border bg-background rounded-xl border p-4">
              <p className="text-muted-foreground mb-2.5 text-xs font-medium tracking-wide uppercase">
                Avulsas × Contratos
              </p>
              <SalesMixBar summary={sales} />
            </div>
          ) : null}
        </div>
      )}
    </HomeSection>
  );
}
