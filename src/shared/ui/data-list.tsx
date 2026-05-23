import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type DataListItem = {
  /** Texto que descreve o campo (ex.: "Nome", "CPF"). */
  label: string;
  /** Valor exibido. `null`, `undefined` ou string vazia caem no `emptyFallback`. */
  value: ReactNode;
  /** Texto exibido quando `value` é vazio. Default: "—". */
  emptyFallback?: string;
};

type DataListProps = {
  /** Lista de pares label/valor. */
  items: DataListItem[];
  /**
   * - `stacked` (default): label em cima, value embaixo. Indicado para mobile / cards estreitos.
   * - `inline`: label à esquerda, value à direita. Indicado para desktop / cards largos.
   * - `responsive`: stacked em mobile, inline em ≥sm.
   */
  orientation?: "stacked" | "inline" | "responsive";
  className?: string;
};

/**
 * Lista semântica de pares label/valor (`<dl>`).
 *
 * Padrão para exibir metadados de uma entidade dentro de um `InfoCard`.
 * Vazios (null/undefined/"") são exibidos como "—" automaticamente.
 */
export function DataList({
  className,
  items,
  orientation = "responsive",
}: DataListProps) {
  return (
    <dl
      className={cn(
        "divide-border divide-y",
        orientation === "inline" && "[&_div]:items-baseline [&_div]:gap-4",
        className,
      )}
    >
      {items.map((item) => (
        <DataRow key={item.label} item={item} orientation={orientation} />
      ))}
    </dl>
  );
}

function DataRow({
  item,
  orientation,
}: {
  item: DataListItem;
  orientation: NonNullable<DataListProps["orientation"]>;
}) {
  const isEmpty =
    item.value === null ||
    item.value === undefined ||
    item.value === "" ||
    (typeof item.value === "number" && Number.isNaN(item.value));

  const display = isEmpty ? (
    <span className="text-muted-foreground">{item.emptyFallback ?? "—"}</span>
  ) : (
    item.value
  );

  return (
    <div
      className={cn(
        "flex py-2.5 first:pt-0 last:pb-0",
        orientation === "stacked" && "flex-col gap-0.5",
        orientation === "inline" && "items-baseline justify-between gap-4",
        orientation === "responsive" &&
          "flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
      )}
    >
      <dt className="text-muted-foreground text-xs font-medium sm:text-sm">
        {item.label}
      </dt>
      <dd
        className={cn(
          "text-foreground text-sm",
          orientation === "stacked" && "",
          orientation === "inline" && "text-right",
          orientation === "responsive" && "sm:text-right",
        )}
      >
        {display}
      </dd>
    </div>
  );
}
