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

function numberFrom(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanFrom(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
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

  const id = value.id ?? value.employeeId ?? value.funcionarioId;
  const name = value.name ?? value.nome;
  const phone = value.phone ?? value.telefone;

  if (id === undefined || name === undefined) {
    return null;
  }

  return {
    cpf: String(value.cpf ?? ""),
    createdAt: String(value.createdAt ?? value.created_at ?? ""),
    email:
      value.email === null || value.email === undefined
        ? null
        : String(value.email),
    id: String(id),
    name: String(name),
    phone: phone === null || phone === undefined ? null : String(phone),
    status: String(value.status ?? "INATIVO"),
  };
}

export async function listFuncionarios(query: FuncionariosQuery) {
  const payload = await serverFetch<unknown>("/api/v1/funcionario", {
    params: {
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      search: query.search?.trim(),
      sort: query.sort,
    },
  });

  const { collection, meta } = extractCollection(payload);
  const data = collection
    .map((item) => normalizeFuncionario(item))
    .filter((item): item is Funcionario => Boolean(item));
  const totalCount = numberFrom(
    meta.totalCount ?? meta.totalItems ?? meta.total ?? meta.count,
    data.length,
  );
  const pageSize = numberFrom(meta.pageSize ?? meta.size, query.pageSize);
  const pageNumber = numberFrom(
    meta.pageNumber ?? meta.page ?? meta.currentPage,
    query.pageNumber,
  );
  const totalPages = numberFrom(
    meta.totalPages ?? meta.pages,
    Math.max(1, Math.ceil(totalCount / pageSize)),
  );

  return {
    data,
    hasNextPage: booleanFrom(meta.hasNextPage, pageNumber < totalPages),
    hasPreviousPage: booleanFrom(meta.hasPreviousPage, pageNumber > 1),
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
  } satisfies PaginatedFuncionarios;
}
