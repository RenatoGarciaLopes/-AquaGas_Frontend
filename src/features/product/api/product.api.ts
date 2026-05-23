import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";

import type {
  ProductType,
  ProductsQuery,
  ProductResponse,
  PaginatedProducts,
} from "@/features/product/types";

import type { ApiResponse } from "@/shared/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function filterByType(list: ProductResponse[], type: ProductType | undefined) {
  if (!type) return list;
  return list.filter((p) => p.type === type);
}

function filterBySearch(list: ProductResponse[], search: string | undefined) {
  const term = search?.trim().toLowerCase();
  if (!term) return list;
  return list.filter((p) => p.name.toLowerCase().includes(term));
}

function sortProducts(list: ProductResponse[], sort: string | undefined) {
  if (!sort) return list;
  const [field, dir] = sort.split(":");
  const desc = dir === "desc";

  return [...list].sort((a, b) => {
    if (field === "name") {
      return desc
        ? b.name.localeCompare(a.name, "pt-BR")
        : a.name.localeCompare(b.name, "pt-BR");
    }
    if (field === "price") {
      return desc ? b.price - a.price : a.price - b.price;
    }
    if (field === "quantity") {
      return desc ? b.quantity - a.quantity : a.quantity - b.quantity;
    }
    return 0;
  });
}

function paginate(
  list: ProductResponse[],
  pageNumber: number,
  pageSize: number,
): PaginatedProducts {
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

/**
 * GET /api/products/{id}
 */
export async function getProductById(id: string): Promise<ProductResponse> {
  const envelope = await serverFetch<ApiResponse<ProductResponse>>(
    `/api/products/${encodeURIComponent(id)}`,
  );

  if (!envelope.success || envelope.data === null) {
    const code = envelope.error?.code;
    throw new ApiError({
      code,
      message: envelope.error?.message ?? "Produto não encontrado.",
      status: code === "NOT_FOUND" ? 404 : 500,
    });
  }

  return envelope.data;
}

/**
 * GET /api/products
 * Backend retorna apenas produtos ativos e não suporta query params.
 * Busca, filtro por tipo, ordenação e paginação são aplicados no servidor (RSC).
 */
export async function listProducts(
  query: ProductsQuery,
): Promise<PaginatedProducts> {
  const envelope =
    await serverFetch<ApiResponse<ProductResponse[]>>("/api/products");

  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message:
        envelope.error?.message ?? "Falha ao carregar lista de produtos.",
      status: 500,
    });
  }

  const filtered = filterBySearch(
    filterByType(envelope.data, query.type),
    query.search,
  );
  const sorted = sortProducts(filtered, query.sort);

  return paginate(sorted, query.pageNumber, query.pageSize);
}
