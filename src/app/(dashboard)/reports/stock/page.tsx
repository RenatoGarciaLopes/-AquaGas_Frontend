import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";
import { StatCard } from "@/shared/ui/stat-card";
import { InfoCard } from "@/shared/ui/info-card";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";

import type { StockMovementType } from "@/features/report/types";
import { buildStockTotals } from "@/features/report/lib/aggregations";
import { getStockMovementReport } from "@/features/report/api/report.api";
import { FilterSelect } from "@/features/report/components/filter-select";
import { StockFlowChart } from "@/features/report/components/stock-flow-chart";
import { StockReportView } from "@/features/report/components/stock-report-view";
import { DateRangeFilter } from "@/features/report/components/date-range-filter";
import {
  readParam,
  resolveRangeFilters,
} from "@/features/report/lib/resolve-filters";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function asMovementType(
  value: string | undefined,
): StockMovementType | undefined {
  return value === "Entry" || value === "Exit" ? value : undefined;
}

export default async function StockReportPage({ searchParams }: PageProps) {
  const range = await resolveRangeFilters(searchParams);
  const productId = await readParam(searchParams, "productId");
  const type = asMovementType(await readParam(searchParams, "type"));

  let report;
  try {
    report = await getStockMovementReport(range);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    return (
      <>
        <PageHeader
          title="Relatório de estoque"
          description="Movimentações de entrada e saída no período selecionado."
          actions={<DateRangeFilter start={range.start} end={range.end} />}
        />
        <ErrorState
          title="Não foi possível carregar o relatório"
          description={
            error instanceof ApiError ? error.message : "Tente novamente."
          }
        />
      </>
    );
  }

  // Lista de produtos derivada dos próprios items, para o filtro.
  const productsInPeriod = Array.from(
    new Map(report.items.map((i) => [i.product.id, i.product])).values(),
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  // Totais respeitam os filtros aplicados (visão consistente entre cards e tabela).
  const filteredItems = report.items.filter((item) => {
    if (productId && item.product.id !== productId) return false;
    if (type && item.type !== type) return false;
    return true;
  });
  const totals = buildStockTotals(filteredItems);

  return (
    <>
      <PageHeader
        title="Relatório de estoque"
        description="Movimentações de entrada e saída no período selecionado."
        actions={<DateRangeFilter start={range.start} end={range.end} />}
      />

      <section
        aria-label="Indicadores de estoque"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          label="Entradas"
          value={totals.entries}
          hint="unidades"
          icon={Icons.arrowDown}
          accent="success"
        />
        <StatCard
          label="Saídas"
          value={totals.exits}
          hint="unidades"
          icon={Icons.arrowUp}
          accent="danger"
        />
        <StatCard
          label="Saldo do período"
          value={totals.balance}
          hint="entradas − saídas"
          accent={totals.balance < 0 ? "warning" : "default"}
        />
      </section>

      <InfoCard
        title="Fluxo diário"
        description="Comparativo de entradas e saídas por dia."
      >
        <StockFlowChart
          items={filteredItems}
          start={range.start}
          end={range.end}
        />
      </InfoCard>

      <div className="flex flex-wrap items-end gap-2">
        <FilterSelect
          paramKey="productId"
          value={productId}
          placeholder="Produto"
          options={productsInPeriod.map((p) => ({
            value: p.id,
            label: p.name,
          }))}
        />
        <FilterSelect
          paramKey="type"
          value={type}
          placeholder="Tipo"
          options={[
            { value: "Entry", label: "Entrada" },
            { value: "Exit", label: "Saída" },
          ]}
        />
      </div>

      <StockReportView items={report.items} productId={productId} type={type} />
    </>
  );
}
