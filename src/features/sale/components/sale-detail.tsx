import Link from "next/link";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import type { SaleResponse } from "@/features/sale/types";
import { CancelSaleButton } from "@/features/sale/components/cancel-sale-button";

type SaleDetailProps = {
  sale: SaleResponse;
};

function isCanceled(status: SaleResponse["status"]) {
  return status === "Canceled" || status === 1;
}

export function SaleDetail({ sale }: SaleDetailProps) {
  const canceled = isCanceled(sale.status);

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/sales"
            className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-2 text-sm font-medium transition"
          >
            <Icon icon={Icons.chevronLeft} aria-hidden className="h-4 w-4" />
            Voltar para vendas
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-3xl font-semibold tracking-tight">
              Venda
            </h1>
            {canceled ? (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-400/15 dark:text-red-400">
                Cancelada
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400">
                Finalizada
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {formatDate(sale.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!canceled && (
            <CancelSaleButton saleId={sale.id} createdAt={sale.createdAt} />
          )}
          <Link
            href="/sales/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
          >
            <Icon icon={Icons.plus} aria-hidden className="h-4 w-4" />
            Nova venda
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="border-border bg-card rounded-lg border p-4">
          <span className="text-muted-foreground text-sm">Cliente</span>
          <p className="text-foreground mt-1 font-semibold">
            {sale.customer?.name ?? "Venda balcão"}
          </p>
          {sale.customer ? (
            <p className="text-muted-foreground mt-1 text-sm">
              {sale.customer.document}
            </p>
          ) : null}
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <span className="text-muted-foreground text-sm">Funcionário</span>
          <p className="text-foreground mt-1 font-semibold">
            {sale.employee.name}
          </p>
        </div>
        <div className="border-border bg-card rounded-lg border p-4">
          <span className="text-muted-foreground text-sm">Total</span>
          <p className="text-foreground mt-1 text-2xl font-semibold">
            {formatCurrency(sale.total)}
          </p>
        </div>
      </section>

      <section className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="border-border border-b px-4 py-3">
          <h2 className="text-foreground font-semibold">Itens</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Quantidade</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {sale.items.map((item) => (
                <tr key={item.productId}>
                  <td className="text-foreground px-4 py-3 font-medium">
                    {item.productName}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {item.quantity}
                  </td>
                  <td className="text-foreground px-4 py-3 text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canceled && sale.cancelReason ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-400/10">
          <h2 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">
            Motivo do cancelamento
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300">
            {sale.cancelReason}
          </p>
        </section>
      ) : null}

      <section className="border-border bg-card ml-auto w-full max-w-sm rounded-lg border p-4">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground font-medium">
              {formatCurrency(sale.subtotal)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Desconto</dt>
            <dd className="text-foreground font-medium">{sale.discount}%</dd>
          </div>
          <div className="border-border flex justify-between gap-4 border-t pt-3">
            <dt className="text-foreground font-semibold">Total</dt>
            <dd className="text-foreground font-semibold">
              {formatCurrency(sale.total)}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
