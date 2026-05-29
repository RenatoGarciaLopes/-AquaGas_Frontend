import Link from "next/link";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import { listProducts } from "@/features/product/api/product.api";
import type { ProductType, ProductsQuery } from "@/features/product/types";
import { ProductsTable } from "@/features/product/components/products-table";
import { ProductsToolbar } from "@/features/product/components/products-toolbar";

type ProductsPageProps = {
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

function parseType(value: string | undefined): ProductType | undefined {
  if (value === "Water" || value === "Gas") return value;
  return undefined;
}

async function resolveQuery(
  searchParams: ProductsPageProps["searchParams"],
): Promise<ProductsQuery> {
  const params = searchParams ? await searchParams : {};
  return {
    pageNumber: positiveInt(firstParam(params.pageNumber), 1),
    pageSize: positiveInt(firstParam(params.pageSize), DEFAULT_PAGE_SIZE),
    search: firstParam(params.search)?.trim() || undefined,
    sort: firstParam(params.sort)?.trim() || undefined,
    type: parseType(firstParam(params.type)),
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const query = await resolveQuery(searchParams);
  const role = await getCurrentUserRole();
  const canManage = isGerente(role);

  let products;
  try {
    products = await listProducts(query);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    if (error instanceof ApiError && error.status === 403) {
      return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <ErrorState
            title="Sem permissão"
            description="Seu usuário não possui acesso ao catálogo de produtos."
          />
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Produtos"
        description="Catálogo de produtos disponíveis"
        actions={
          canManage ? (
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
              Novo produto
            </Link>
          ) : null
        }
      />
      <ProductsToolbar
        key={`${query.search ?? ""}-${query.type ?? ""}`}
        initialSearch={query.search}
      />
      <ProductsTable
        canManage={canManage}
        initialData={products}
        query={query}
      />
    </div>
  );
}
