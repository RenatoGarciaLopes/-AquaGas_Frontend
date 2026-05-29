import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";

import type {
  SalesQuery,
  SaleResponse,
  PaginatedSales,
  SaleStatusFilter,
} from "@/features/sale/types";

import type { ApiResponse } from "@/shared/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureData<T>(envelope: ApiResponse<T>, fallback: string): T {
  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message: envelope.error?.message ?? fallback,
      status: envelope.error?.code === "NOT_FOUND" ? 404 : 500,
    });
  }
  return envelope.data;
}

function filterBySearch(
  list: SaleResponse[],
  search: string | undefined,
): SaleResponse[] {
  const term = search?.trim().toLowerCase();
  if (!term) return list;
  return list.filter(
    (s) =>
      s.customer?.name.toLowerCase().includes(term) ||
      s.employee.name.toLowerCase().includes(term),
  );
}

function filterByStatus(
  list: SaleResponse[],
  status: SaleStatusFilter | undefined,
): SaleResponse[] {
  if (!status) return list;
  return list.filter((s) => {
    if (status === "Canceled") return s.status === "Canceled" || s.status === 1;
    if (status === "Finished") return s.status === "Finished" || s.status === 0;
    return true;
  });
}

function filterByDateRange(
  list: SaleResponse[],
  dateFrom: string | undefined,
  dateTo: string | undefined,
): SaleResponse[] {
  let result = list;
  if (dateFrom) {
    const [y, m, d] = dateFrom.split("-").map(Number);
    const from = new Date(y!, m! - 1, d!, 0, 0, 0, 0);
    result = result.filter((s) => new Date(s.createdAt) >= from);
  }
  if (dateTo) {
    const [y, m, d] = dateTo.split("-").map(Number);
    const to = new Date(y!, m! - 1, d!, 23, 59, 59, 999);
    result = result.filter((s) => new Date(s.createdAt) <= to);
  }
  return result;
}

function filterByValueRange(
  list: SaleResponse[],
  minTotal: number | undefined,
  maxTotal: number | undefined,
): SaleResponse[] {
  let result = list;
  if (minTotal !== undefined)
    result = result.filter((s) => s.total >= minTotal);
  if (maxTotal !== undefined)
    result = result.filter((s) => s.total <= maxTotal);
  return result;
}

function sortSales(
  list: SaleResponse[],
  sort: string | undefined,
): SaleResponse[] {
  if (!sort) return list;
  const [field, dir] = sort.split(":");
  const desc = dir === "desc";

  return [...list].sort((a, b) => {
    if (field === "createdAt") {
      const diff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return desc ? -diff : diff;
    }
    if (field === "total") {
      return desc ? b.total - a.total : a.total - b.total;
    }
    return 0;
  });
}

function paginate(
  list: SaleResponse[],
  pageNumber: number,
  pageSize: number,
): PaginatedSales {
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

// ─── API ─────────────────────────────────────────────────────────────────────

export async function getSaleById(id: string): Promise<SaleResponse> {
  const envelope = await serverFetch<ApiResponse<SaleResponse>>(
    `/api/sales/${encodeURIComponent(id)}`,
  );
  return ensureData(envelope, "Venda não encontrada.");
}

/**
 * GET /api/sales
 * Backend retorna todas as vendas sem suporte a query params.
 * Busca, filtros, ordenação e paginação são aplicados no servidor (RSC).
 */
export async function listSales(query: SalesQuery): Promise<PaginatedSales> {
  const envelope = await serverFetch<ApiResponse<SaleResponse[]>>("/api/sales");
  const all = ensureData(envelope, "Falha ao carregar vendas.");

  const filtered = filterByValueRange(
    filterByDateRange(
      filterByStatus(filterBySearch(all, query.search), query.status),
      query.dateFrom,
      query.dateTo,
    ),
    query.minTotal,
    query.maxTotal,
  );

  return paginate(
    sortSales(filtered, query.sort),
    query.pageNumber,
    query.pageSize,
  );
}
