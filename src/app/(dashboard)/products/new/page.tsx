import { isGerente } from "@/shared/auth/roles";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import { CreateProductForm } from "@/features/product/components/create-product-form";

export default async function NewProductPage() {
  const role = await getCurrentUserRole();

  if (!isGerente(role)) {
    return (
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Sem permissão"
          description="Apenas gerentes podem cadastrar produtos."
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Cadastrar produto"
        description="Adicione um novo produto ao catálogo."
      />
      <CreateProductForm />
    </main>
  );
}
