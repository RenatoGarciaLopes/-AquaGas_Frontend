import Link from "next/link";

import { isGerente } from "@/shared/auth/roles";
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
    <main className="mx-auto w-full max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-1">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition"
        >
          Produtos
        </Link>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Cadastrar produto
        </h1>
      </header>

      <CreateProductForm />
    </main>
  );
}
