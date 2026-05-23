import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import { getProductById } from "@/features/product/api/product.api";
import { EditProductForm } from "@/features/product/components/edit-product-form";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const role = await getCurrentUserRole();
  if (!isGerente(role)) {
    return (
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Sem permissão"
          description="Apenas gerentes podem editar produtos."
        />
      </main>
    );
  }

  let product;
  try {
    product = await getProductById(id);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login?expired=1");
      if (error.status === 404) notFound();
      if (error.status === 403) {
        return (
          <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            <ErrorState
              title="Sem permissão"
              description="Você não tem acesso a este produto."
            />
          </main>
        );
      }
    }
    throw error;
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Editar produto" description={product.name} />
      <EditProductForm product={product} />
    </main>
  );
}
