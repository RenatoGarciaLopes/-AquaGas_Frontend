import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { PageHeader } from "@/shared/ui/page-header";
import { isGerente, getCurrentUserRole } from "@/shared/auth/roles";

import type { FuncionariosQuery } from "@/features/funcionario/types";
import { listFuncionarios } from "@/features/funcionario/api/funcionario.api";
import { FuncionariosTable } from "@/features/funcionario/components/funcionarios-table";
import { FuncionariosToolbar } from "@/features/funcionario/components/funcionarios-toolbar";
import { PermissionDeniedToast } from "@/features/funcionario/components/permission-denied-toast";

type FuncionariosPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const DEFAULT_PAGE_SIZE = 10;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function getQuery(searchParams: FuncionariosPageProps["searchParams"]) {
  const params = searchParams ? await searchParams : {};
  const search = firstParam(params.search)?.trim();
  const sort = firstParam(params.sort)?.trim();

  return {
    pageNumber: positiveNumber(firstParam(params.pageNumber), 1),
    pageSize: positiveNumber(firstParam(params.pageSize), DEFAULT_PAGE_SIZE),
    search: search || undefined,
    sort: sort || undefined,
  } satisfies FuncionariosQuery;
}

async function getFuncionarios(query: FuncionariosQuery) {
  try {
    return await listFuncionarios(query);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }

    if (error instanceof ApiError && error.status === 403) {
      return null;
    }

    throw error;
  }
}

export default async function FuncionariosPage({
  searchParams,
}: FuncionariosPageProps) {
  const query = await getQuery(searchParams);
  const role = await getCurrentUserRole();
  const canManage = isGerente(role);
  const funcionarios = await getFuncionarios(query);

  if (!funcionarios) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
        <PermissionDeniedToast />
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-6 bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Funcionários"
        description="Consulte, filtre e acompanhe os funcionários cadastrados."
        actions={
          canManage ? (
            <Link
              href="/funcionarios/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--aquagas-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--aquagas-primary-hover)] focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Novo Funcionário
            </Link>
          ) : null
        }
      />
      <FuncionariosToolbar
        key={query.search ?? "empty-search"}
        initialSearch={query.search}
      />
      <FuncionariosTable
        canManage={canManage}
        initialData={funcionarios}
        query={query}
      />
    </main>
  );
}
