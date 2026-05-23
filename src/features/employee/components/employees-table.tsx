"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatPhone, formatCpfMasked } from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import { RowActions } from "@/features/employee/components/row-actions";
import type {
  EmployeesQuery,
  EmployeeWithUser,
  PaginatedEmployees,
} from "@/features/employee/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeRoleLabel(role: string) {
  const upper = role.trim().toUpperCase();
  return upper === "MANAGER" || upper === "GERENTE" ? "GERENTE" : "FUNCIONÁRIO";
}

function RoleBadge({ role }: { role: string }) {
  const label = normalizeRoleLabel(role);
  if (label === "GERENTE") {
    return (
      <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700">
        {label}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
      {label}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

type EmployeesTableProps = {
  canManage: boolean;
  initialData: PaginatedEmployees;
  query: EmployeesQuery;
};

export function EmployeesTable({
  canManage,
  initialData,
  query,
}: EmployeesTableProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateUrl(updates: Record<string, null | number | string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    });
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const columns = useMemo<ColumnDef<EmployeeWithUser>[]>(
    () => [
      {
        accessorFn: (row) => row.employee.name,
        cell: ({ getValue }) => (
          <span className="text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
        enableSorting: true,
        header: "Nome",
        id: "name",
      },
      {
        accessorFn: (row) => row.employee.cpf,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground font-mono">
            {formatCpfMasked(getValue<string>())}
          </span>
        ),
        enableSorting: true,
        header: "CPF",
        id: "cpf",
      },
      {
        accessorFn: (row) => row.employee.phone,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatPhone(getValue<string | null>())}
          </span>
        ),
        enableSorting: false,
        header: "Telefone",
        id: "phone",
      },
      {
        accessorFn: (row) => row.employee.email,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {getValue<string | null>() ?? "—"}
          </span>
        ),
        enableSorting: false,
        header: "Email",
        id: "email",
      },
      {
        accessorFn: (row) => row.user.role,
        cell: ({ getValue }) => <RoleBadge role={getValue<string>()} />,
        enableSorting: true,
        header: "Cargo",
        id: "role",
      },
      {
        cell: ({ row }) => (
          <div className="text-right">
            <RowActions canManage={canManage} employee={row.original} />
          </div>
        ),
        enableSorting: false,
        header: () => <span className="sr-only">Ações</span>,
        id: "actions",
      },
    ],
    [canManage],
  );

  return (
    <DataTable
      columns={columns}
      data={initialData.data}
      sort={query.sort}
      onSortChange={(sort) =>
        updateUrl({ pageNumber: 1, ...(sort ? { sort } : { sort: "" }) })
      }
      pagination={{
        hasNextPage: initialData.hasNextPage,
        hasPreviousPage: initialData.hasPreviousPage,
        onPageChange: (page) => updateUrl({ pageNumber: page }),
        pageNumber: initialData.pageNumber,
        pageSize: initialData.pageSize,
        totalCount: initialData.totalCount,
        totalPages: initialData.totalPages,
      }}
      emptyState={
        <EmptyState
          title="Nenhum funcionário encontrado"
          description="Ajuste os filtros ou registre o primeiro funcionário."
          action={
            canManage ? (
              <Link
                href="/employees/new"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
              >
                <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
                Criar funcionário
              </Link>
            ) : null
          }
        />
      }
    />
  );
}
