import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import type { IconifyIcon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";

export type StatCardAccent = "default" | "success" | "warning" | "danger";

type StatCardProps = {
  /** Texto curto que descreve a métrica. Ex.: "Preço", "Estoque atual". */
  label: string;
  /** Valor principal. `null`/`undefined` exibem o `emptyFallback`. */
  value: ReactNode;
  /** Texto auxiliar embaixo do valor. Ex.: "por unidade". */
  hint?: ReactNode;
  /** Variante de cor do valor/borda. */
  accent?: StatCardAccent;
  /** Ícone opcional à direita. */
  icon?: IconifyIcon;
  /** Texto exibido quando `value` é vazio. Default: "—". */
  emptyFallback?: string;
  className?: string;
};

const ACCENT_VALUE: Record<StatCardAccent, string> = {
  default: "text-foreground",
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-red-500",
};

const ACCENT_ICON: Record<StatCardAccent, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/15 text-emerald-500",
  warning: "bg-amber-500/15 text-amber-500",
  danger: "bg-red-500/15 text-red-500",
};

/**
 * Card de métrica destacada para hero stats (preço, estoque, contadores).
 *
 * Mantém estrutura fixa (label em cima, value grande no meio, hint opcional);
 * o `accent` muda só a cor do valor e do ícone, sem trocar o layout.
 */
export function StatCard({
  accent = "default",
  className,
  emptyFallback = "—",
  hint,
  icon,
  label,
  value,
}: StatCardProps) {
  const isEmpty = value === null || value === undefined || value === "";
  const displayValue = isEmpty ? emptyFallback : value;

  return (
    <article
      className={cn(
        "border-border bg-card flex items-start gap-3 rounded-xl border p-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <p
          className={cn(
            "mt-1.5 text-2xl leading-tight font-semibold",
            ACCENT_VALUE[accent],
          )}
        >
          {displayValue}
        </p>
        {hint ? (
          <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
        ) : null}
      </div>

      {icon ? (
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            ACCENT_ICON[accent],
          )}
        >
          <Icon icon={icon} className="h-5 w-5" aria-hidden />
        </div>
      ) : null}
    </article>
  );
}
