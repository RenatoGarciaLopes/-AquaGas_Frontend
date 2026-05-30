import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";

import type {
  PlanCycle,
  PlanStatus,
  PlansQuery,
  PlanResponse,
  PaginatedPlans,
} from "@/features/plan/types";

import type { ApiResponse } from "@/shared/types/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function filterByStatus(list: PlanResponse[], status: PlanStatus | undefined) {
  if (!status) return list;
  return list.filter((plan) => plan.status === status);
}

function filterByCycle(list: PlanResponse[], cycle: PlanCycle | undefined) {
  if (!cycle) return list;
  return list.filter((plan) => plan.cycle === cycle);
}

function filterBySearch(list: PlanResponse[], search: string | undefined) {
  const term = search?.trim().toLowerCase();
  if (!term) return list;

  return list.filter((plan) => {
    return (
      plan.customerName.toLowerCase().includes(term) ||
      plan.document.includes(term)
    );
  });
}

function sortPlans(list: PlanResponse[], sort: string | undefined) {
  if (!sort) return list;
  const [field, dir] = sort.split(":");
  const desc = dir === "desc";

  return [...list].sort((a, b) => {
    let cmp = 0;

    if (field === "customerName") {
      cmp = a.customerName.localeCompare(b.customerName, "pt-BR");
    } else if (field === "total") {
      cmp = a.total - b.total;
    } else if (field === "startDate") {
      cmp = a.startDate.localeCompare(b.startDate);
    } else if (field === "endDate") {
      cmp = a.endDate.localeCompare(b.endDate);
    } else if (field === "status") {
      cmp = a.status.localeCompare(b.status, "pt-BR");
    }

    return desc ? -cmp : cmp;
  });
}

function paginate(
  list: PlanResponse[],
  pageNumber: number,
  pageSize: number,
): PaginatedPlans {
  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    data: list.slice(start, start + pageSize),
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
    pageNumber: safePage,
    pageSize,
    totalCount,
    totalPages,
  };
}

// ─── API ────────────────────────────────────────────────────────────────────

export async function getPlanById(id: string): Promise<PlanResponse> {
  const envelope = await serverFetch<ApiResponse<PlanResponse>>(
    `/api/plans/${encodeURIComponent(id)}`,
  );

  if (!envelope.success || envelope.data === null) {
    const code = envelope.error?.code;
    throw new ApiError({
      code,
      message: envelope.error?.message ?? "Plano não encontrado.",
      status: code === "NOT_FOUND" ? 404 : 500,
    });
  }

  return envelope.data;
}

export async function listPlans(query: PlansQuery): Promise<PaginatedPlans> {
  const envelope = await serverFetch<ApiResponse<PlanResponse[]>>("/api/plans");

  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message: envelope.error?.message ?? "Falha ao carregar lista de planos.",
      status: 500,
    });
  }

  const filtered = filterBySearch(
    filterByCycle(filterByStatus(envelope.data, query.status), query.cycle),
    query.search,
  );
  const sorted = sortPlans(filtered, query.sort);

  return paginate(sorted, query.pageNumber, query.pageSize);
}
