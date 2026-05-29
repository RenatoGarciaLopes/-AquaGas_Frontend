import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import type { IconifyIcon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";

type EntityHeaderProps = {
  /** Ícone/avatar à esquerda. */
  icon?: IconifyIcon;
  /** Nome principal da entidade. Renderiza como `<h1>`. */
  title: string;
  /** Linha secundária sob o título (ex.: CPF, e-mail, ID de pedido). */
  subtitle?: ReactNode;
  /** Slot horizontal para badges (tipo, status, etc.). */
  badges?: ReactNode;
  /** Informação técnica discreta (ex.: ID, criadoEm). */
  meta?: ReactNode;
  /** Slot de ações primárias no canto direito (ex.: botões "Editar"). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Cabeçalho de identidade reutilizável para telas de detalhe.
 *
 * Em mobile: tudo empilhado. Em desktop: ícone + título à esquerda,
 * ações à direita.
 */
export function EntityHeader({
  actions,
  badges,
  className,
  icon,
  meta,
  subtitle,
  title,
}: EntityHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="bg-muted text-muted-foreground flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Icon icon={icon} className="h-6 w-6" aria-hidden />
          </div>
        ) : null}

        <div className="min-w-0 space-y-1.5">
          <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            {title}
          </h1>

          {subtitle ? (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          ) : null}

          {badges ? (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {badges}
            </div>
          ) : null}

          {meta ? (
            <div className="text-muted-foreground pt-1 text-xs">{meta}</div>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
