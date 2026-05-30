import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { StatCard } from "@/shared/ui/stat-card";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";

import { getSalesReport } from "@/features/report/api/report.api";
import { FilterSelect } from "@/features/report/components/filter-select";
import type { SalesItemType, SalesItemStatus } from "@/features/report/types";
import { SalesReportView } from "@/features/report/components/sales-report-view";
import { DateRangeFilter } from "@/features/report/components/date-range-filter";
import {
  readParam,
  resolveRangeFilters,
} from "@/features/report/lib/resolve-filters";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function asStatus(value: string | undefined): SalesItemStatus | undefined {
  return value === "FINISHED" || value === "CANCELLED" ? value : undefined;
}
function asType(value: string | undefined): SalesItemType | undefined {
  return value === "SALE" || value === "PLAN" ? value : undefined;
}

export default async function SalesReportPage({ searchParams }: PageProps) {
  const range = await resolveRangeFilters(searchParams);
  const status = asStatus(await readParam(searchParams, "status"));
  const type = asType(await readParam(searchParams, "type"));

  let report;
  try {
    report = await getSalesReport(range);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    return (
      <>
        <PageHeader
          title="Relatório de vendas"
          description="Receita avulsa e por contrato no período selecionado."
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

  return (
    <>
      <PageHeader
        title="Relatório de vendas"
        description="Receita avulsa e por contrato no período selecionado."
        actions={<DateRangeFilter start={range.start} end={range.end} />}
      />

      <section
        aria-label="Indicadores de vendas"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Receita total"
          value={formatCurrency(report.summary.totalRevenue)}
          hint={`${report.summary.totalSales} venda(s) finalizada(s)`}
          icon={Icons.barChart}
          accent="success"
        />
        <StatCard
          label="Vendas avulsas"
          value={formatCurrency(report.summary.totalSpotSales)}
          icon={Icons.shoppingCart}
        />
        <StatCard
          label="Vendas por contrato"
          value={formatCurrency(report.summary.totalContractSales)}
          icon={Icons.fileText}
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(report.summary.averageTicket)}
          hint={`${report.summary.cancelledSales} cancelada(s)`}
          accent={report.summary.cancelledSales > 0 ? "warning" : "default"}
        />
      </section>

      <div className="flex flex-wrap items-end gap-2">
        <FilterSelect
          paramKey="status"
          value={status}
          placeholder="Status"
          options={[
            { value: "FINISHED", label: "Finalizada" },
            { value: "CANCELLED", label: "Cancelada" },
          ]}
        />
        <FilterSelect
          paramKey="type"
          value={type}
          placeholder="Tipo"
          options={[
            { value: "SALE", label: "Avulsa" },
            { value: "PLAN", label: "Contrato" },
          ]}
        />
      </div>

      <SalesReportView
        items={report.items}
        status={status}
        type={type}
        start={range.start}
        end={range.end}
      />
    </>
  );
}
