import Link from "next/link";
import { Icon } from "@iconify/react";
import { redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { PageHeader } from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";

import { listSales } from "@/features/sale/api/sale.api";

function statusLabel(status: unknown) {
  if (status === "Canceled" || status === 1) return "Cancelada";
  return "Finalizada";
}

export default async function SalesListPage() {
  let sales;
  try {
    sales = await listSales();
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

      {sales.length === 0 ? (
        <EmptyState
          title="Nenhuma venda registrada"
          description="Finalize a primeira venda avulsa para iniciar o histórico."
          action={
            <Link
              href="/sales/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition"
            >
              <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
              Nova venda
            </Link>
          }
        />
      ) : (
        <section className="border-border bg-card overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Funcionário</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="text-muted-foreground px-4 py-3">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="text-foreground px-4 py-3 font-medium">
                      {sale.customer?.name ?? "Venda balcão"}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {sale.employee.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {statusLabel(sale.status)}
                    </td>
                    <td className="text-foreground px-4 py-3 text-right font-semibold">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="text-primary hover:text-primary/80 text-sm font-semibold transition"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
