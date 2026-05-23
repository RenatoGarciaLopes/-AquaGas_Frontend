"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import {
  formatCnpj,
  formatPhone,
  formatCpfMasked,
} from "@/shared/lib/formatters";

import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";

import { CustomerTypeBadge } from "@/features/customer/components/customer-type-badge";
import type {
  CustomersQuery,
  CustomerResponse,
  PaginatedCustomers,
} from "@/features/customer/types";

type CustomersTableProps = {
  initialData: PaginatedCustomers;
  query: CustomersQuery;
};

function formatCustomerDocument(customer: CustomerResponse) {
  if (customer.typeDocument === "PJ") return formatCnpj(customer.document);
  return formatCpfMasked(customer.document);
}

function formatAddress(customer: CustomerResponse) {
  const { address } = customer;
  if (!address) return "-";

  const streetLine = [address.street, address.number]
    .filter(Boolean)
    .join(", ");
  const cityLine = [address.neighborhood, address.city]
    .filter(Boolean)
    .join(" · ");

  return [streetLine, cityLine].filter(Boolean).join(" — ") || "-";
}

export function CustomersTable({ initialData, query }: CustomersTableProps) {
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

  const columns = useMemo<ColumnDef<CustomerResponse>[]>(
    () => [
      {
        accessorKey: "name",
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
        accessorKey: "document",
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono">
            {formatCustomerDocument(row.original)}
          </span>
        ),
        enableSorting: true,
        header: "Documento",
        id: "document",
      },
      {
        accessorKey: "typeDocument",
        cell: ({ row }) => (
          <CustomerTypeBadge type={row.original.typeDocument} />
        ),
        enableSorting: true,
        header: "Tipo",
        id: "typeDocument",
      },
      {
        accessorKey: "phone",
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
        accessorKey: "email",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {getValue<string | null>() ?? "-"}
          </span>
        ),
        enableSorting: false,
        header: "Email",
        id: "email",
      },
      {
        accessorFn: (row) => formatAddress(row),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<string>()}</span>
        ),
        enableSorting: false,
        header: "Endereço",
        id: "address",
      },
    ],
    [],
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
          title="Nenhum cliente encontrado"
          description="Ajuste a busca ou cadastre o primeiro cliente."
          action={
            <Link
              href="/customers/new"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
              Novo cliente
            </Link>
          }
        />
      }
    />
  );
}
