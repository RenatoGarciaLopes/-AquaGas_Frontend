import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { StatCard } from "@/shared/ui/stat-card";
import { InfoCard } from "@/shared/ui/info-card";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";

import type { SalesReport, PenaltyReport } from "@/features/report/types";
import { resolveRangeFilters } from "@/features/report/lib/resolve-filters";
import { SalesMixChart } from "@/features/report/components/sales-mix-chart";
import { TopProductsList } from "@/features/report/components/top-products-list";
import { DateRangeFilter } from "@/features/report/components/date-range-filter";
import { RevenueByDayChart } from "@/features/report/components/revenue-by-day-chart";
import {
  getSalesReport,
  getPenaltyReport,
} from "@/features/report/api/report.api";
import { PenaltiesStatusChart } from "@/features/report/components/penalties-status-chart";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function safeFetch<T>(loader: () => Promise<T>): Promise<T | Error> {
  try {
    return await loader();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    return error instanceof Error ? error : new Error("Erro desconhecido");
  }
}

function isErr<T>(value: T | Error): value is Error {
  return value instanceof Error;
}

export default async function ReportsOverviewPage({ searchParams }: PageProps) {
  const range = await resolveRangeFilters(searchParams);

  const [salesResult, penaltyResult] = await Promise.all([
    safeFetch<SalesReport>(() => getSalesReport(range)),
    safeFetch<PenaltyReport>(() => getPenaltyReport(range)),
  ]);

  const sales = !isErr(salesResult) ? salesResult : null;
  const penalties = !isErr(penaltyResult) ? penaltyResult : null;

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Indicadores consolidados de vendas, estoque e multas no período."
        actions={<DateRangeFilter start={range.start} end={range.end} />}
      />

      <section
        aria-label="Indicadores principais"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Receita total"
          value={sales ? formatCurrency(sales.summary.totalRevenue) : "—"}
          hint={
            sales
              ? `${sales.summary.totalSales} venda(s) finalizada(s)`
              : "Indisponível"
          }
          icon={Icons.barChart}
          accent="success"
        />
        <StatCard
          label="Ticket médio"
          value={sales ? formatCurrency(sales.summary.averageTicket) : "—"}
          hint="por venda finalizada"
          icon={Icons.shoppingCart}
        />
        <StatCard
          label="Vendas canceladas"
          value={sales?.summary.cancelledSales ?? "—"}
          hint="no período"
          icon={Icons.x}
          accent={
            sales && sales.summary.cancelledSales > 0 ? "warning" : "default"
          }
        />
        <StatCard
          label="Multas pendentes"
          value={
            penalties
              ? formatCurrency(
                  penalties.summary.pendingAmount +
                    penalties.summary.overdueAmount,
                )
              : "—"
          }
          hint={
            penalties
              ? `${penalties.summary.totalPenalties} multa(s) no período`
              : "Indisponível"
          }
          icon={Icons.alertTriangle}
          accent={
            penalties && penalties.summary.overdueAmount > 0
              ? "danger"
              : "default"
          }
        />
      </section>

      <section
        aria-label="Vendas no período"
        className="grid gap-4 lg:grid-cols-3"
      >
        <InfoCard
          title="Receita por dia"
          description="Distribuição diária da receita finalizada no período."
          className="lg:col-span-2"
        >
          {sales ? (
            <RevenueByDayChart
              items={sales.items}
              start={range.start}
              end={range.end}
            />
          ) : (
            <ErrorState
              title="Não foi possível carregar vendas"
              description={
                isErr(salesResult)
                  ? salesResult.message
                  : "Tente novamente em instantes."
              }
            />
          )}
        </InfoCard>

        <InfoCard
          title="Mix de vendas"
          description="Avulsa vs. contrato (receita)."
        >
          {sales ? (
            <SalesMixChart summary={sales.summary} />
          ) : (
            <p className="text-muted-foreground text-sm">Indisponível.</p>
          )}
        </InfoCard>
      </section>

      <section
        aria-label="Rankings e multas"
        className="grid gap-4 lg:grid-cols-2"
      >
        <InfoCard
          title="Top produtos"
          description="Maiores receitas por produto no período."
        >
          {sales ? (
            <TopProductsList items={sales.items} />
          ) : (
            <p className="text-muted-foreground text-sm">Indisponível.</p>
          )}
        </InfoCard>

        <InfoCard
          title="Multas por status"
          description="Distribuição de multas contratuais por status."
        >
          {penalties ? (
            <PenaltiesStatusChart items={penalties.items} />
          ) : (
            <ErrorState
              title="Não foi possível carregar multas"
              description={
                isErr(penaltyResult)
                  ? penaltyResult.message
                  : "Tente novamente em instantes."
              }
            />
          )}
        </InfoCard>
      </section>
    </>
  );
}
