import Link from "next/link";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { ApiError } from "@/shared/api/errors";
import { PageHeader } from "@/shared/ui/page-header";

import { listSales } from "@/features/sale/api/sale.api";
import { SalesTable } from "@/features/sale/components/sales-table";
import { SalesToolbar } from "@/features/sale/components/sales-toolbar";
import type { SalesQuery, SaleStatusFilter } from "@/features/sale/types";

type SalesPageProps = {
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

function positiveFloat(value: string | undefined): number | undefined {
  const n = parseFloat(value ?? "");
  return isFinite(n) && n >= 0 ? n : undefined;
}

function parseStatus(value: string | undefined): SaleStatusFilter | undefined {
  if (value === "Finished" || value === "Canceled") return value;
  return undefined;
}

function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

async function resolveQuery(
  searchParams: SalesPageProps["searchParams"],
): Promise<SalesQuery> {
  const params = searchParams ? await searchParams : {};
  return {
    pageNumber: positiveInt(firstParam(params.pageNumber), 1),
    pageSize: DEFAULT_PAGE_SIZE,
    search: firstParam(params.search)?.trim() || undefined,
    sort: firstParam(params.sort)?.trim() || undefined,
    status: parseStatus(firstParam(params.status)),
    dateFrom: parseDate(firstParam(params.dateFrom)),
    dateTo: parseDate(firstParam(params.dateTo)),
    minTotal: positiveFloat(firstParam(params.minTotal)),
    maxTotal: positiveFloat(firstParam(params.maxTotal)),
  };
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const query = await resolveQuery(searchParams);

  let sales;
  try {
    sales = await listSales(query);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    throw error;
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Vendas"
        description="Histórico de vendas avulsas registradas no sistema."
        actions={
          <Link
            href="/sales/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
          >
            <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
            Nova venda
          </Link>
        }
      />

      <SalesToolbar
        key={`${query.search ?? ""}-${query.status ?? ""}-${query.dateFrom ?? ""}-${query.dateTo ?? ""}-${query.minTotal ?? ""}-${query.maxTotal ?? ""}`}
      />

      <SalesTable initialData={sales} query={query} />
    </main>
  );
}
