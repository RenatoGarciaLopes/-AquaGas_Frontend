import Link from "next/link";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import type { EmployeesQuery } from "@/features/employee/types";
import { listEmployees } from "@/features/employee/api/employee.api";
import { EmployeesTable } from "@/features/employee/components/employees-table";
import { EmployeesToolbar } from "@/features/employee/components/employees-toolbar";

type EmployeesPageProps = {
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

async function resolveQuery(
  searchParams: EmployeesPageProps["searchParams"],
): Promise<EmployeesQuery> {
  const params = searchParams ? await searchParams : {};
  return {
    pageNumber: positiveInt(firstParam(params.pageNumber), 1),
    pageSize: positiveInt(firstParam(params.pageSize), DEFAULT_PAGE_SIZE),
    search: firstParam(params.search)?.trim() || undefined,
    sort: firstParam(params.sort)?.trim() || undefined,
  };
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const query = await resolveQuery(searchParams);
  const role = await getCurrentUserRole();
  const canManage = isGerente(role);

  let employees;
  try {
    employees = await listEmployees(query);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    if (error instanceof ApiError && error.status === 403) {
      return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <ErrorState
            title="Sem permissão"
            description="Seu usuário não possui acesso à lista de funcionários."
          />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Funcionários"
        description="Consulte e gerencie os funcionários cadastrados no sistema."
        actions={
          canManage ? (
            <Link
              href="/employees/new"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
              Novo funcionário
            </Link>
          ) : null
        }
      />
      <EmployeesToolbar
        key={query.search ?? "no-search"}
        initialSearch={query.search}
      />
      <EmployeesTable
        canManage={canManage}
        initialData={employees}
        query={query}
      />
    </div>
  );
}
