"use client";

import { formatCurrency } from "@/shared/lib/formatters";

import { DataList } from "@/shared/ui/data-list";

type Product = {
  id: string;
  name: string;
  price: number;
};

type ReviewData = {
  customerName: string;
  cycle: string;
  deliveryDay: number;
  billingDay: number;
  discount?: number;
  durationInMonths?: number;
  items: Array<{ productId: string; quantity: number }>;
};

type CreatePlanReviewStepProps = {
  data: ReviewData;
  products: Product[];
};

const CYCLE_LABELS: Record<string, string> = {
  Monthly: "Mensal",
  Quarterly: "Trimestral",
  Annual: "Anual",
  Custom: "Personalizado",
};

export function CreatePlanReviewStep({
  data,
  products,
}: CreatePlanReviewStepProps) {
  const productMap = new Map(products.map((p) => [p.id, p]));

  const subtotal = data.items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const discountAmount =
    data.discount && data.discount > 0 ? subtotal * (data.discount / 100) : 0;
  const total = subtotal - discountAmount;

  return (
    <div className="space-y-6">
      <DataList
        items={[
          { label: "Cliente", value: data.customerName },
          { label: "Ciclo", value: CYCLE_LABELS[data.cycle] ?? data.cycle },
          ...(data.cycle === "Custom" && data.durationInMonths
            ? [{ label: "Duração", value: `${data.durationInMonths} meses` }]
            : []),
          { label: "Dia da entrega", value: String(data.deliveryDay) },
          { label: "Dia de vencimento", value: String(data.billingDay) },
          {
            label: "Desconto",
            value:
              data.discount && data.discount > 0 ? `${data.discount}%` : null,
            emptyFallback: "Sem desconto",
          },
        ]}
      />

      <div className="border-border divide-border divide-y rounded-lg border">
        <div className="bg-muted/40 px-4 py-2.5 text-sm font-medium">
          Itens do plano
        </div>
        {data.items.map((item) => {
          const product = productMap.get(item.productId);
          if (!product) return null;
          return (
            <div
              key={item.productId}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <span className="text-foreground">
                {product.name} × {item.quantity}
              </span>
              <span className="text-muted-foreground font-mono">
                {formatCurrency(product.price * item.quantity)}
              </span>
            </div>
          );
        })}
        <div className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground font-mono">
            {formatCurrency(subtotal)}
          </span>
        </div>
        {discountAmount > 0 ? (
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">
              Desconto ({data.discount}%)
            </span>
            <span className="font-mono text-red-500">
              −{formatCurrency(discountAmount)}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold">
          <span className="text-foreground">Total estimado por período</span>
          <span className="text-foreground font-mono">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        O valor final será calculado pelo sistema considerando a duração e o
        ciclo do plano.
      </p>
    </div>
  );
}
