import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import { getProductById } from "@/features/product/api/product.api";
import { ProductDetail } from "@/features/product/components/product-detail";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const role = await getCurrentUserRole();
  const canManage = isGerente(role);

  let product;
  try {
    product = await getProductById(id);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login?expired=1");
      if (error.status === 404) notFound();
      if (error.status === 403) {
        return (
          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <ErrorState
              title="Sem permissão"
              description="Você não tem acesso a este produto."
            />
          </div>
        );
      }
    }
    throw error;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <ProductDetail product={product} canManage={canManage} />
    </div>
  );
}
