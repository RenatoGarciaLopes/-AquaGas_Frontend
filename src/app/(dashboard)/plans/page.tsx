import Link from "next/link";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";

import { listPlans } from "@/features/plan/api/plan.api";
import { PlansTable } from "@/features/plan/components/plans-table";
import { PlansToolbar } from "@/features/plan/components/plans-toolbar";
import type { PlanCycle, PlansQuery, PlanStatus } from "@/features/plan/types";

type PlansPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_PAGE_SIZE = 10;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

const VALID_STATUSES: PlanStatus[] = [
  "Active",
  "AwaitingClosure",
  "Canceled",
  "Finished",
  "Suspended",
];

const VALID_CYCLES: PlanCycle[] = ["Monthly", "Quarterly", "Annual", "Custom"];

function parseStatus(value: string | undefined): PlanStatus | undefined {
  if (value === "all") return undefined;
  if (VALID_STATUSES.includes(value as PlanStatus)) return value as PlanStatus;
  return "Active";
}

function parseCycle(value: string | undefined): PlanCycle | undefined {
  if (VALID_CYCLES.includes(value as PlanCycle)) return value as PlanCycle;
  return undefined;
}

async function resolveQuery(
  searchParams: PlansPageProps["searchParams"],
): Promise<PlansQuery> {
  const params = searchParams ? await searchParams : {};
  return {
    pageNumber: positiveInt(firstParam(params.pageNumber), 1),
    pageSize: positiveInt(firstParam(params.pageSize), DEFAULT_PAGE_SIZE),
    search: firstParam(params.search)?.trim() || undefined,
    sort: firstParam(params.sort)?.trim() || undefined,
    status: parseStatus(firstParam(params.status)),
    cycle: parseCycle(firstParam(params.cycle)),
  };
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const query = await resolveQuery(searchParams);

  let plans;
  try {
    plans = await listPlans(query);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    if (error instanceof ApiError && error.status === 403) {
      return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <ErrorState
            title="Sem permissão"
            description="Seu usuário não possui acesso à lista de planos."
          />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 pb-8 sm:p-6 sm:pb-10 lg:p-8 lg:pb-12">
      <PageHeader
        title="Planos"
        description="Gerencie planos de assinatura de água e gás dos clientes."
      />
      <PlansToolbar
        actionSlot={
          <Link
            href="/plans/new"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
          >
            <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
            Novo plano
          </Link>
        }
        key={`${query.search ?? ""}-${query.status ?? ""}-${query.cycle ?? ""}`}
        initialSearch={query.search}
      />
      <PlansTable initialData={plans} query={query} />
    </div>
  );
}
