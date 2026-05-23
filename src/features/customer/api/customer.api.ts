import { onlyDigits } from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";

import type {
  CustomersQuery,
  CustomerResponse,
  PaginatedCustomers,
  CustomerDocumentType,
} from "@/features/customer/types";

import type { ApiResponse } from "@/shared/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function filterByType(
  list: CustomerResponse[],
  type: CustomerDocumentType | undefined,
) {
  if (!type) return list;
  return list.filter((customer) => customer.typeDocument === type);
}

function filterBySearch(list: CustomerResponse[], search: string | undefined) {
  const term = search?.trim().toLowerCase();
  if (!term) return list;

  const numericTerm = onlyDigits(term);

  return list.filter((customer) => {
    const document = onlyDigits(customer.document);
    const phone = onlyDigits(customer.phone);
    const textTargets = [
      customer.name,
      customer.email,
      customer.address?.street,
      customer.address?.neighborhood,
      customer.address?.city,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      textTargets.includes(term) ||
      (numericTerm !== "" &&
        (document.includes(numericTerm) || phone.includes(numericTerm)))
    );
  });
}

function sortCustomers(list: CustomerResponse[], sort: string | undefined) {
  if (!sort) return list;
  const [field, dir] = sort.split(":");
  const desc = dir === "desc";

  return [...list].sort((a, b) => {
    let aVal = "";
    let bVal = "";

    if (field === "name") {
      aVal = a.name;
      bVal = b.name;
    } else if (field === "document") {
      aVal = onlyDigits(a.document);
      bVal = onlyDigits(b.document);
    } else if (field === "typeDocument") {
      aVal = a.typeDocument;
      bVal = b.typeDocument;
    }

    return desc
      ? bVal.localeCompare(aVal, "pt-BR")
      : aVal.localeCompare(bVal, "pt-BR");
  });
}

function paginate(
  list: CustomerResponse[],
  pageNumber: number,
  pageSize: number,
): PaginatedCustomers {
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
 * GET /api/customers
 * Backend retorna apenas clientes ativos e não suporta query params.
 * Busca, filtro PF/PJ, ordenação e paginação são aplicados no servidor (RSC).
 */
export async function listCustomers(
  query: CustomersQuery,
): Promise<PaginatedCustomers> {
  const envelope =
    await serverFetch<ApiResponse<CustomerResponse[]>>("/api/customers");

  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message:
        envelope.error?.message ?? "Falha ao carregar lista de clientes.",
      status: 500,
    });
  }

  const filtered = filterBySearch(
    filterByType(envelope.data, query.type),
    query.search,
  );
  const sorted = sortCustomers(filtered, query.sort);

  return paginate(sorted, query.pageNumber, query.pageSize);
}
