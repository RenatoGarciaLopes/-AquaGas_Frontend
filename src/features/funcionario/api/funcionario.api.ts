import { serverFetch } from "@/shared/api/server-fetch";

import type {
  Funcionario,
  FuncionariosQuery,
  PaginatedFuncionarios,
} from "@/features/funcionario/types";

type ApiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractCollection(payload: unknown) {
  if (Array.isArray(payload)) {
    return { collection: payload, meta: {} };
  }

  if (!isRecord(payload)) {
    return { collection: [], meta: {} };
  }

  const nested = payload.data;

  if (Array.isArray(nested)) {
    return { collection: nested, meta: payload };
  }

  if (isRecord(nested)) {
    const nestedCollection =
      nested.data ?? nested.items ?? nested.results ?? nested.content;

    return {
      collection: Array.isArray(nestedCollection) ? nestedCollection : [],
      meta: nested,
    };
  }

  const collection =
    payload.items ?? payload.results ?? payload.content ?? payload.funcionarios;

  return {
    collection: Array.isArray(collection) ? collection : [],
    meta: payload,
  };
}

function normalizeFuncionario(value: unknown): Funcionario | null {
  if (!isRecord(value)) {
    return null;
  }

  // backend retorna { user, employee }; aceita também objeto plano
  const emp = isRecord(value.employee) ? value.employee : value;

  const id = emp.id ?? emp.employeeId ?? emp.funcionarioId;
  const name = emp.name ?? emp.nome;
  const phone = emp.phone ?? emp.telefone;

  if (id === undefined || name === undefined) {
    return null;
  }

  return {
    cpf: String(emp.cpf ?? ""),
    createdAt: String(emp.createdAt ?? emp.created_at ?? ""),
    email:
      emp.email === null || emp.email === undefined ? null : String(emp.email),
    id: String(id),
    name: String(name),
    phone: phone === null || phone === undefined ? null : String(phone),
    status: String(emp.status ?? "ATIVO"),
  };
}

export async function listFuncionarios(query: FuncionariosQuery) {
  const payload = await serverFetch<unknown>("/api/employees");

  const { collection } = extractCollection(payload);
  const allData = collection
    .map((item) => normalizeFuncionario(item))
    .filter((item): item is Funcionario => Boolean(item));

  const search = query.search?.trim().toLowerCase();
  const filtered = search
    ? allData.filter(
        (f) => f.name.toLowerCase().includes(search) || f.cpf.includes(search),
      )
    : allData;

  const totalCount = filtered.length;
  const { pageSize } = query;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumber = Math.min(query.pageNumber, totalPages);
  const start = (pageNumber - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  } satisfies PaginatedFuncionarios;
}
