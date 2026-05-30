import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type DetailShellProps = {
  /** Slot no topo — geralmente um link "Voltar". */
  back?: ReactNode;
  /** Cabeçalho de identidade (`EntityHeader` ou equivalente). */
  header: ReactNode;
  /** Tira de métricas destacadas no topo. Cards filhos viram colunas do grid. */
  hero?: ReactNode;
  /** Corpo da tela — `InfoCard`s ficam em grid responsivo. */
  children: ReactNode;
  className?: string;
};

/**
 * Moldura padrão das telas de detalhe (Detail Pages).
 *
 * Layout:
 * - `back` slot opcional no topo
 * - `header` full-width (EntityHeader)
 * - `hero` opcional em grid `sm:grid-cols-2 lg:grid-cols-3 gap-4`
 * - `children` em grid `gap-6 lg:grid-cols-2` para InfoCards
 *
 * Componente puro de layout — não tem estado próprio. Toda lógica (busca de
 * dados, regras de role) vive na page Server Component ou na feature.
 */
export function DetailShell({
  back,
  children,
  className,
  header,
  hero,
}: DetailShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {back}

      {header}

      {hero ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{hero}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">{children}</div>
    </div>
  );
}
