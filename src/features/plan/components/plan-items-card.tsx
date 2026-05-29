import { InfoCard } from "@/shared/ui/info-card";

import type { PlanItemResponse } from "@/features/plan/types";

type PlanItemsCardProps = {
  items: PlanItemResponse[];
};

export function PlanItemsCard({ items }: PlanItemsCardProps) {
  return (
    <InfoCard title="Itens do plano" description="Produtos incluídos em cada entrega.">
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum item cadastrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground pb-2 text-left font-medium">
                  Produto
                </th>
                <th className="text-muted-foreground pb-2 text-right font-medium">
                  Quantidade
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {items.map((item) => (
                <tr key={item.productId}>
                  <td className="text-foreground py-2.5 font-medium">
                    {item.productName}
                  </td>
                  <td className="text-muted-foreground py-2.5 text-right font-mono">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InfoCard>
  );
}
