import { redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { ErrorState } from "@/shared/ui/error-state";
import { getSessionUser } from "@/shared/auth/server";

import { listPlans } from "@/features/plan/api/plan.api";
import { listSales } from "@/features/sale/api/sale.api";
import type { PlanResponse } from "@/features/plan/types";
import type { SaleResponse } from "@/features/sale/types";
import type { ProductResponse } from "@/features/product/types";
import { listProducts } from "@/features/product/api/product.api";
import type { SalesSummary, PenaltySummary } from "@/features/report/types";
import {
  getSalesReport,
  getPenaltyReport,
} from "@/features/report/api/report.api";

import { buildHomeData } from "./_home/lib/aggregate";
import { buildCalendarEvents } from "./_home/lib/calendar";
import { HomeGreeting } from "./_home/components/home-greeting";
import { CalendarPanel } from "./_home/components/calendar-panel";
import { periodToRange, parseHomePeriod } from "./_home/lib/periods";
import { AttentionBanner } from "./_home/components/attention-banner";
import { ManagerDashboard } from "./_home/components/manager-dashboard";
import { HomeIndicatorsGrid } from "./_home/components/home-indicators";

export const metadata = { title: "Visão geral | AquaGás" };

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Busca uma lista completa; em 401 redireciona, demais falhas viram `null`. */
async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    return null;
  }
}

const FULL_PAGE = { pageNumber: 1, pageSize: 10_000 } as const;

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const period = parseHomePeriod(firstParam(params.period));

  const { userName, role } = await getSessionUser();
  const manager = isGerente(role);
  const now = new Date();

  const [plansResult, salesResult, productsResult] = await Promise.all([
    safeFetch(() => listPlans(FULL_PAGE)),
    safeFetch(() => listSales(FULL_PAGE)),
    safeFetch(() => listProducts(FULL_PAGE)),
  ]);

  // Backend totalmente indisponível: nada a operar.
  if (!plansResult && !salesResult && !productsResult) {
    return (
      <div className="flex min-h-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Não foi possível carregar a visão geral"
          description="Verifique sua conexão e tente novamente."
        />
      </div>
    );
  }

  const plans: PlanResponse[] = plansResult?.data ?? [];
  const sales: SaleResponse[] = salesResult?.data ?? [];
  const products: ProductResponse[] = productsResult?.data ?? [];

  const home = buildHomeData(plans, sales, products, now);
  const calendarEvents = buildCalendarEvents(plans, now);
  const attention = home.attention.filter(
    (item) => !item.managerOnly || manager,
  );

  // Dashboards gerenciais: só Gerente, falham de forma isolada.
  let salesSummary: SalesSummary | null = null;
  let penaltySummary: PenaltySummary | null = null;
  let managerFailed = false;

  if (manager) {
    const range = periodToRange(period, now);
    const [salesReport, penaltyReport] = await Promise.all([
      safeFetch(() => getSalesReport(range)),
      safeFetch(() => getPenaltyReport(range)),
    ]);
    salesSummary = salesReport?.summary ?? null;
    penaltySummary = penaltyReport?.summary ?? null;
    managerFailed = !salesReport && !penaltyReport;
  }

  return (
    <div className="flex min-h-full flex-col gap-4 p-4 pb-8 sm:p-6 sm:pb-10 lg:p-8 lg:pb-12">
      <HomeGreeting
        indicators={home.indicators}
        now={now}
        role={role}
        userName={userName}
      />

      <AttentionBanner items={attention} />

      <HomeIndicatorsGrid indicators={home.indicators} role={role} />

      <CalendarPanel events={calendarEvents} />

      {manager ? (
        <ManagerDashboard
          failed={managerFailed}
          penalties={penaltySummary}
          period={period}
          sales={salesSummary}
        />
      ) : null}
    </div>
  );
}
