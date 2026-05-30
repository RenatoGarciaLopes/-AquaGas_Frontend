"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

import type { AttentionItem } from "../types";

const SEVERITY_STYLES = {
  danger: {
    accent: "border-l-red-500",
    chip: "bg-red-500/15 text-red-500",
  },
  warning: {
    accent: "border-l-amber-500",
    chip: "bg-amber-500/15 text-amber-500",
  },
} as const;

type AttentionBannerProps = {
  items: AttentionItem[];
};

/**
 * Banner condicional "Precisa de atenção". Cada alerta abre um modal listando
 * as inconsistências individuais, com link para a tela de detalhe de cada uma.
 * Não renderiza nada quando não há itens.
 */
export function AttentionBanner({ items }: AttentionBannerProps) {
  const [active, setActive] = useState<AttentionItem | null>(null);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  if (items.length === 0) return null;

  return (
    <>
      <section
        aria-label="Precisa de atenção"
        className="border-border bg-card overflow-hidden rounded-2xl border"
      >
        <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5">
          <Icon
            icon={Icons.alertTriangle}
            aria-hidden
            className="h-4 w-4 text-amber-500"
          />
          <h2 className="text-foreground text-sm font-semibold">
            Precisa de atenção
          </h2>
        </div>

        <ul className="divide-border divide-y">
          {items.map((item) => {
            const styles = SEVERITY_STYLES[item.severity];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className={cn(
                    "hover:bg-muted/50 flex w-full items-center justify-between gap-3 border-l-2 px-4 py-3 text-left transition active:scale-[0.997]",
                    styles.accent,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-bold",
                        styles.chip,
                      )}
                    >
                      {item.count}
                    </span>
                    <span className="text-foreground truncate text-sm font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
                    Ver detalhes
                    <Icon
                      icon={Icons.arrowRight}
                      aria-hidden
                      className="h-3.5 w-3.5"
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {active !== null && typeof document !== "undefined"
        ? createPortal(
            <AttentionModal item={active} onClose={() => setActive(null)} />,
            document.body,
          )
        : null}
    </>
  );
}

function AttentionModal({
  item,
  onClose,
}: {
  item: AttentionItem;
  onClose: () => void;
}) {
  const styles = SEVERITY_STYLES[item.severity];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      <div className="border-border bg-card aq-animate-pop relative z-10 flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-bold",
                styles.chip,
              )}
            >
              {item.count}
            </span>
            <h3 className="text-foreground truncate text-sm font-semibold">
              {item.label}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1 transition active:scale-90"
          >
            <Icon icon={Icons.x} aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {item.details.map((detail) => (
            <li key={detail.id}>
              <Link
                href={detail.href}
                onClick={onClose}
                className="border-border bg-background hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition hover:border-cyan-400/40"
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">
                    {detail.title}
                  </p>
                  {detail.subtitle ? (
                    <p className="text-muted-foreground truncate text-xs">
                      {detail.subtitle}
                    </p>
                  ) : null}
                </div>
                <Icon
                  icon={Icons.arrowRight}
                  aria-hidden
                  className="text-muted-foreground h-4 w-4 shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
