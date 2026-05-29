import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { StatCard } from "@/shared/ui/stat-card";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";

import { getPenaltyReport } from "@/features/report/api/report.api";
import { FilterSelect } from "@/features/report/components/filter-select";
import type { PenaltyType, PenaltyStatus } from "@/features/report/types";
import { DateRangeFilter } from "@/features/report/components/date-range-filter";
import { PenaltiesReportView } from "@/features/report/components/penalties-report-view";
import {
  readParam,
  resolveRangeFilters,
} from "@/features/report/lib/resolve-filters";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function asStatus(value: string | undefined): PenaltyStatus | undefined {
  if (
    value === "PENDING_PAYMENT" ||
    value === "PAID" ||
    value === "WAIVED" ||
    value === "CANCELED" ||
    value === "OVERDUE"
  )
    return value;
  return undefined;
}

function asType(value: string | undefined): PenaltyType | undefined {
  return value === "DOWNGRADE" || value === "EARLY_CANCELLATION"
    ? value
    : undefined;
}

export default async function PenaltiesReportPage({ searchParams }: PageProps) {
  const range = await resolveRangeFilters(searchParams);
  const status = asStatus(await readParam(searchParams, "status"));
  const type = asType(await readParam(searchParams, "type"));

  let report;
  try {
    report = await getPenaltyReport(range);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    return (
      <>
        <PageHeader
          title="Relatório de multas"
          description="Multas contratuais (downgrade e cancelamento antecipado) no período."
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
        title="Relatório de multas"
        description="Multas contratuais (downgrade e cancelamento antecipado) no período."
        actions={<DateRangeFilter start={range.start} end={range.end} />}
      />

      <section
        aria-label="Indicadores de multas"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Total de multas"
          value={report.summary.totalPenalties}
          hint="no período"
          icon={Icons.alertTriangle}
        />
        <StatCard
          label="Pendentes"
          value={formatCurrency(report.summary.pendingAmount)}
          accent="warning"
        />
        <StatCard
          label="Vencidas"
          value={formatCurrency(report.summary.overdueAmount)}
          accent={report.summary.overdueAmount > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Pagas"
          value={formatCurrency(report.summary.paidAmount)}
          hint={`Isentas: ${formatCurrency(report.summary.waivedAmount)}`}
          accent="success"
        />
      </section>

      <div className="flex flex-wrap items-end gap-2">
        <FilterSelect
          paramKey="status"
          value={status}
          placeholder="Status"
          options={[
            { value: "PENDING_PAYMENT", label: "Pendente" },
            { value: "OVERDUE", label: "Vencida" },
            { value: "PAID", label: "Paga" },
            { value: "WAIVED", label: "Isenta" },
            { value: "CANCELED", label: "Cancelada" },
          ]}
        />
        <FilterSelect
          paramKey="type"
          value={type}
          placeholder="Tipo"
          options={[
            { value: "DOWNGRADE", label: "Downgrade" },
            { value: "EARLY_CANCELLATION", label: "Cancelamento antecipado" },
          ]}
        />
      </div>

      <PenaltiesReportView items={report.items} status={status} type={type} />
    </>
  );
}
