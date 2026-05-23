import Link from "next/link";

import { CreateCustomerForm } from "@/features/customer/components/create-customer-form";

export default function NewCustomerPage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-1">
        <Link
          href="/customers"
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition"
        >
          Clientes
        </Link>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Cadastrar cliente
        </h1>
      </header>

      <CreateCustomerForm />
    </main>
  );
}
