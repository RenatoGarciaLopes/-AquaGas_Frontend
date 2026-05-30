"use client";

import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { EmptyState } from "@/shared/ui/empty-state";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import { parsePlanSubActionError } from "@/features/plan/lib/plan-errors";
import { confirmBillingPayment } from "@/features/plan/api/plan-client.api";

import { HomeSection } from "./home-section";
import type { HomeReceivable } from "../types";

const PAGE_SIZE = 7;

type ReceivablesPanelProps = {
  className?: string;
  receivables: HomeReceivable[];
};

export function ReceivablesPanel({
  className,
  receivables: initial,
}: ReceivablesPanelProps) {
  const router = useRouter();
  const [receivables, setReceivables] = useState(initial);
  const [pending, setPending] = useState<HomeReceivable | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(receivables.length / PAGE_SIZE));
  // A lista encolhe ao confirmar; mantém a página dentro dos limites.
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = receivables.slice(start, start + PAGE_SIZE);

  async function handleConfirm() {
    const target = pending;
    if (!target) return;

    setPending(null);
    setConfirmingId(target.billingId);

    try {
      await confirmBillingPayment({ billingId: target.billingId });
      setReceivables((prev) =>
        prev.filter((r) => r.billingId !== target.billingId),
      );
      toast.success("Pagamento confirmado.");
      startTransition(() => router.refresh());
    } catch (error) {
      const { message } = parsePlanSubActionError(
        error,
        error instanceof ApiError ? error.status : 0,
      );
      toast.error(message);
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <HomeSection
      id="recebiveis"
      title="Recebíveis a confirmar"
      icon={Icons.wallet}
      className={className}
    >
      {receivables.length === 0 ? (
        <EmptyState
          title="Nada a confirmar"
          description="Não há pagamentos de planos aguardando registro."
        />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((r, index) => (
            <li
              key={r.billingId}
              style={{ animationDelay: `${index * 30}ms` }}
              className="border-border bg-background aq-animate-fade-up flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-medium">
                  {r.customerName}
                </p>
                <p
                  className={cn(
                    "mt-0.5 flex items-center gap-1 text-[11px]",
                    r.overdue ? "text-red-500" : "text-muted-foreground",
                  )}
                >
                  <Icon icon={Icons.calendar} aria-hidden className="h-3 w-3" />
                  {r.overdue ? "Venceu em " : "Vence em "}
                  {formatDate(r.dueDate)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-foreground text-sm font-semibold">
                  {formatCurrency(r.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => setPending(r)}
                  disabled={confirmingId === r.billingId}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition duration-150 hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-300/50 focus:outline-none active:scale-95 disabled:opacity-60"
                >
                  <Icon icon={Icons.check} aria-hidden className="h-4 w-4" />
                  {confirmingId === r.billingId ? "…" : "Registrar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs">
            {start + 1}–{start + visible.length} de {receivables.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Página anterior"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon icon={Icons.chevronLeft} aria-hidden className="h-4 w-4" />
            </button>
            <span className="text-muted-foreground min-w-12 text-center text-xs font-medium">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Próxima página"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Icon icon={Icons.chevronRight} aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={pending !== null}
        title="Registrar pagamento?"
        description={
          pending
            ? `Confirmar o recebimento de ${formatCurrency(pending.amount)} de ${pending.customerName}. O pagamento é registrado manualmente, conforme processo da distribuidora.`
            : undefined
        }
        confirmLabel="Registrar pagamento"
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </HomeSection>
  );
}
