import { redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { serverFetch } from "@/shared/api/server-fetch";
import { PageHeader } from "@/shared/ui/page-header";
import { getCurrentUserRole } from "@/shared/auth/server";

import type { ApiResponse } from "@/shared/types/api";
import type { CustomerResponse } from "@/features/customer/types";
import type { ProductResponse } from "@/features/product/types";

import { CreatePlanForm } from "@/features/plan/components/create-plan-form";

async function getCustomers() {
  const envelope =
    await serverFetch<ApiResponse<CustomerResponse[]>>("/api/customers");
  if (!envelope.success || envelope.data === null) return [];
  return envelope.data;
}

async function getProducts() {
  const envelope =
    await serverFetch<ApiResponse<ProductResponse[]>>("/api/products");
  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message: envelope.error?.message ?? "Falha ao carregar produtos.",
      status: 500,
    });
  }
  return envelope.data;
}

export default async function NewPlanPage() {
  const role = await getCurrentUserRole();
  const canDiscount = isGerente(role);

  let customers: CustomerResponse[];
  let products: ProductResponse[];

  try {
    [customers, products] = await Promise.all([getCustomers(), getProducts()]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    throw error;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Novo plano"
        description="Configure um plano de assinatura para um cliente."
      />
      <CreatePlanForm
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          document: c.document,
          typeDocument: c.typeDocument,
        }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          type: p.type,
        }))}
        canDiscount={canDiscount}
      />
    </div>
  );
}
