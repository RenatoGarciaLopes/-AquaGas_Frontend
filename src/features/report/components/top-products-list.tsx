import { formatCurrency } from "@/shared/lib/formatters";

import type { SalesReportItem } from "@/features/report/types";
import { buildTopProducts } from "@/features/report/lib/aggregations";

type Props = {
  items: SalesReportItem[];
  limit?: number;
};

export function TopProductsList({ items, limit = 5 }: Props) {
  const rows = buildTopProducts(items, limit);

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Sem produtos vendidos no período.
      </p>
    );
  }

  const max = rows[0]!.revenue || 1;

  return (
    <ol className="space-y-3">
      {rows.map((row, index) => {
        const width = Math.max(6, Math.round((row.revenue / max) * 100));
        return (
          <li key={row.productId} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-foreground flex min-w-0 items-center gap-2 truncate font-medium">
                <span className="bg-muted text-muted-foreground inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                  {index + 1}
                </span>
                <span className="truncate">{row.productName}</span>
              </span>
              <span className="text-foreground shrink-0 font-semibold tabular-nums">
                {formatCurrency(row.revenue)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {row.quantity} un
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
