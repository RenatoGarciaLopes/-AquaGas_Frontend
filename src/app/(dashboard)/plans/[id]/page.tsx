import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { ErrorState } from "@/shared/ui/error-state";
import { serverFetch } from "@/shared/api/server-fetch";
import { getCurrentUserRole } from "@/shared/auth/server";

import { getPlanById } from "@/features/plan/api/plan.api";
import type { ProductResponse } from "@/features/product/types";
import { PlanDetail } from "@/features/plan/components/plan-detail";

import type { ApiResponse } from "@/shared/types/api";

type PlanPageProps = {
  params: Promise<{ id: string }>;
};

async function getProducts() {
  const envelope =
    await serverFetch<ApiResponse<ProductResponse[]>>("/api/products");
  if (!envelope.success || !envelope.data) return [];
  return envelope.data;
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;

  const role = await getCurrentUserRole();
  const canManage = isGerente(role);

  let plan;
  let products: ProductResponse[] = [];
  try {
    [plan, products] = await Promise.all([getPlanById(id), getProducts()]);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login?expired=1");
      if (error.status === 404) notFound();
      if (error.status === 403) {
        return (
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <ErrorState
              title="Sem permissão"
              description="Você não tem acesso aos dados deste plano."
            />
          </div>
        );
      }
    }
    throw error;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PlanDetail
        plan={plan}
        canManage={canManage}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
        }))}
      />
    </div>
  );
}
