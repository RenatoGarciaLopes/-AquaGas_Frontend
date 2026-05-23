import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";

import type {
  EmployeeDetail,
  EmployeesQuery,
  EmployeeResponse,
  EmployeeWithUser,
  PaginatedEmployees,
} from "@/features/employee/types";

import type { ApiResponse } from "@/shared/types/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeRole(role: string) {
  const upper = role.trim().toUpperCase();
  return upper === "MANAGER" || upper === "GERENTE" ? "GERENTE" : "FUNCIONARIO";
}

function sortEmployees(
  list: EmployeeWithUser[],
  sort: string | undefined,
): EmployeeWithUser[] {
  if (!sort) return list;
  const [field, dir] = sort.split(":");
  const desc = dir === "desc";

  return [...list].sort((a, b) => {
    let aVal = "";
    let bVal = "";

    if (field === "name") {
      aVal = a.employee.name;
      bVal = b.employee.name;
    } else if (field === "cpf") {
      aVal = a.employee.cpf;
      bVal = b.employee.cpf;
    } else if (field === "role") {
      aVal = normalizeRole(a.user.role);
      bVal = normalizeRole(b.user.role);
    }

    return desc
      ? bVal.localeCompare(aVal, "pt-BR")
      : aVal.localeCompare(bVal, "pt-BR");
  });
}

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/employees
 * Retorna lista completa (sem paginação no backend).
 * Paginação, busca e ordenação são feitas no cliente (RSC).
 */
export async function listEmployees(
  query: EmployeesQuery,
): Promise<PaginatedEmployees> {
  const envelope =
    await serverFetch<ApiResponse<EmployeeWithUser[]>>("/api/employees");

  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message:
        envelope.error?.message ?? "Falha ao carregar lista de funcionários.",
      status: 500,
    });
  }

  const allData = envelope.data;

  // Busca client-side (backend não suporta query params neste endpoint)
  const search = query.search?.trim().toLowerCase();
  const filtered = search
    ? allData.filter(
        ({ employee }) =>
          employee.name.toLowerCase().includes(search) ||
          employee.cpf.includes(search),
      )
    : allData;

  // Ordenação client-side
  const sorted = sortEmployees(filtered, query.sort);

  // Paginação client-side
  const totalCount = sorted.length;
  const { pageSize } = query;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumber = Math.min(Math.max(1, query.pageNumber), totalPages);
  const start = (pageNumber - 1) * pageSize;

  return {
    data: sorted.slice(start, start + pageSize),
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  };
}

function normalizeEmployeeDetail(data: EmployeeResponse | EmployeeWithUser) {
  const employee = "employee" in data ? data.employee : data;

  return {
    ...employee,
    status: employee.isActive === false ? "INATIVO" : "ATIVO",
  } satisfies EmployeeDetail;
}

/**
 * GET /api/employees/{id}
 * Retorna os dados completos de um funcionário.
 */
export async function getEmployeeById(id: string): Promise<EmployeeDetail> {
  const envelope = await serverFetch<
    ApiResponse<EmployeeResponse | EmployeeWithUser>
  >(`/api/employees/${encodeURIComponent(id)}`);

  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message:
        envelope.error?.message ?? "Falha ao carregar dados do funcionário.",
      status: 500,
    });
  }

  return normalizeEmployeeDetail(envelope.data);
}
