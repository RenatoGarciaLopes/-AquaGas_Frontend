import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type InfoCardProps = {
  /** Título do card. */
  title: string;
  /** Texto opcional sob o título. */
  description?: string;
  /** Slot à direita do header (ex.: link "Ver tudo", botão de edição). */
  action?: ReactNode;
  /** Conteúdo do card — geralmente um `<DataList />`, mas pode ser qualquer node. */
  children: ReactNode;
  /** Classes extras para ajustar grid span (ex.: "lg:col-span-2"). */
  className?: string;
};

/**
 * Wrapper de bloco para uma seção de conteúdo numa tela de detalhe.
 *
 * Composição típica: `<InfoCard title="Identificação"><DataList … /></InfoCard>`.
 */
export function InfoCard({
  action,
  children,
  className,
  description,
  title,
}: InfoCardProps) {
  return (
    <section
      className={cn(
        "border-border bg-card rounded-xl border p-6 shadow-sm shadow-black/5",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start justify-between gap-3",
          description ? "mb-4" : "mb-3",
        )}
      >
        <div>
          <h2 className="text-foreground text-base font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      {children}
    </section>
  );
}
