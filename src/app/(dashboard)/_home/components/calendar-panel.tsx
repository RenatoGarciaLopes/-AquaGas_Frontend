"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import type { IconifyIcon } from "@iconify/react";
import { useMemo, useState, useTransition } from "react";
import {
  format,
  addWeeks,
  isSameDay,
  addMonths,
  endOfWeek,
  endOfMonth,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
} from "date-fns";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import { apiGet } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import type { PlanResponse } from "@/features/plan/types";
import { parsePlanSubActionError } from "@/features/plan/lib/plan-errors";
import { ReasonDialog } from "@/features/plan/components/plan-reason-dialog";
import { rescheduleDeliverySchema } from "@/features/plan/schemas/reschedule-delivery.schema";
import {
  cancelDelivery,
  confirmDelivery,
  rescheduleDelivery,
  confirmBillingPayment,
} from "@/features/plan/api/plan-client.api";

import type { ApiResponse } from "@/shared/types/api";

import { HomeSection } from "./home-section";
import type { CalendarEvent, CalendarEventType } from "../types";

const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

const MAX_POSTPONE_DAYS = 7;

type TypeMeta = {
  chip: string;
  dot: string;
  icon: IconifyIcon;
  label: string;
};

const TYPE_META: Record<CalendarEventType, TypeMeta> = {
  delivery: {
    chip: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    icon: Icons.delivery,
    label: "Entregas",
  },
  receivable: {
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    icon: Icons.wallet,
    label: "Recebíveis",
  },
  penalty: {
    chip: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    icon: Icons.billList,
    label: "Multas",
  },
  expiring: {
    chip: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
    icon: Icons.calendarMark,
    label: "Vencimentos",
  },
};

const ALL_TYPES = Object.keys(TYPE_META) as CalendarEventType[];

function dayKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function dayStartMs(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** Entrega futura não pode ser confirmada antes da data prevista. */
function isFutureDate(iso: string): boolean {
  return dayStartMs(new Date(iso)) > dayStartMs(new Date());
}

type ViewMode = "month" | "week";
type PendingConfirm = { event: CalendarEvent; kind: "delivery" | "receivable" };

export function CalendarPanel({
  events: initial,
}: {
  events: CalendarEvent[];
}) {
  const router = useRouter();
  const [events, setEvents] = useState(initial);
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [filters, setFilters] = useState<Record<CalendarEventType, boolean>>({
    delivery: true,
    receivable: true,
    penalty: true,
    expiring: true,
  });
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<CalendarEvent | null>(null);
  const [reschedulePending, setReschedulePending] = useState(false);
  const [, startTransition] = useTransition();

  const visibleDays = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor, { weekStartsOn: 1 });
      const end = endOfWeek(cursor, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor, view]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      if (!filters[event.type]) continue;
      const key = event.date.slice(0, 10);
      const list = map.get(key);
      if (list) list.push(event);
      else map.set(key, [event]);
    }
    return map;
  }, [events, filters]);

  const today = new Date();
  const selectedKey = dayKey(selected);
  const selectedEvents = eventsByDay.get(selectedKey) ?? [];

  const periodLabel =
    view === "week"
      ? `${format(visibleDays[0]!, "d MMM", { locale: ptBR })} – ${format(visibleDays[visibleDays.length - 1]!, "d MMM yyyy", { locale: ptBR })}`
      : format(cursor, "MMMM yyyy", { locale: ptBR });

  function navigate(direction: -1 | 1) {
    setCursor((prev) =>
      view === "week" ? addWeeks(prev, direction) : addMonths(prev, direction),
    );
  }

  function goToday() {
    setCursor(new Date());
    setSelected(new Date());
  }

  async function handleConfirm() {
    const target = pending;
    if (!target) return;

    setPending(null);
    setConfirmingId(target.event.id);

    try {
      if (target.kind === "delivery" && target.event.deliveryId) {
        await confirmDelivery({ deliveryId: target.event.deliveryId });
        toast.success("Entrega confirmada.");
      } else if (target.kind === "receivable" && target.event.billingId) {
        await confirmBillingPayment({ billingId: target.event.billingId });
        toast.success("Pagamento confirmado.");
      }
      setEvents((prev) => prev.filter((e) => e.id !== target.event.id));
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

  // Reagendar entrega futura: o backend só reagenda entregas canceladas e só
  // permite cancelar entregas futuras — então movemos a data com a sequência
  // cancelar → reagendar, conferindo antes se já não está cancelada.
  async function handleReschedule(data: Record<string, string>) {
    const target = rescheduleTarget;
    if (!target?.deliveryId) return;

    const newDate = data.newDate!;
    const reason = data.reason!;

    if (dayStartMs(new Date(newDate)) < dayStartMs(new Date())) {
      toast.error("A nova data deve ser futura.");
      return;
    }
    const diffDays = Math.round(
      (dayStartMs(new Date(newDate)) - dayStartMs(new Date(target.date))) /
        86_400_000,
    );
    if (diffDays > MAX_POSTPONE_DAYS) {
      toast.error(
        `A nova data não pode passar de ${MAX_POSTPONE_DAYS} dias após a original.`,
      );
      return;
    }

    setReschedulePending(true);
    try {
      // Confere o status atual antes de cancelar para não gerar conflito.
      const envelope = await apiGet<ApiResponse<PlanResponse>>(
        `/api/plans/${encodeURIComponent(target.planId)}`,
      );
      const live = envelope.data?.deliveries.find(
        (d) => d.id === target.deliveryId,
      );

      if (live?.status === "Delivered") {
        toast.error("Esta entrega já foi realizada.");
        return;
      }
      if (live?.status !== "Cancelled") {
        await cancelDelivery({ deliveryId: target.deliveryId, reason });
      }
      await rescheduleDelivery({
        deliveryId: target.deliveryId,
        newDate,
        reason,
      });

      // Move o evento para a nova data (re-agrupa no dia correto).
      setEvents((prev) =>
        prev.map((e) =>
          e.id === target.id ? { ...e, date: newDate, overdue: false } : e,
        ),
      );
      toast.success("Entrega reagendada.");
      setRescheduleTarget(null);
      startTransition(() => router.refresh());
    } catch (error) {
      const { message } = parsePlanSubActionError(
        error,
        error instanceof ApiError ? error.status : 0,
      );
      toast.error(message);
      startTransition(() => router.refresh());
    } finally {
      setReschedulePending(false);
    }
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="border-border bg-background inline-flex items-center gap-0.5 rounded-lg border p-0.5">
        {(["month", "week"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition duration-150 active:scale-95",
              view === mode
                ? "bg-cyan-500 text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode === "month" ? "Mês" : "Semana"}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={goToday}
        className="border-border text-foreground hover:bg-muted rounded-lg border px-2.5 py-1 text-xs font-semibold transition duration-150 active:scale-95"
      >
        Hoje
      </button>
    </div>
  );

  return (
    <HomeSection
      id="calendario"
      title="Calendário operacional"
      icon={Icons.calendar}
      action={toolbar}
    >
      {/* Navegação + filtros */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Período anterior"
            onClick={() => navigate(-1)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 w-8 items-center justify-center rounded-lg border transition duration-150 active:scale-90"
          >
            <Icon icon={Icons.chevronLeft} aria-hidden className="h-4 w-4" />
          </button>
          <span className="text-foreground min-w-40 text-center text-sm font-semibold capitalize">
            {periodLabel}
          </span>
          <button
            type="button"
            aria-label="Próximo período"
            onClick={() => navigate(1)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-muted inline-flex h-8 w-8 items-center justify-center rounded-lg border transition duration-150 active:scale-90"
          >
            <Icon icon={Icons.chevronRight} aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_TYPES.map((type) => {
            const meta = TYPE_META[type];
            const active = filters[type];
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, [type]: !prev[type] }))
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition duration-150 active:scale-95",
                  active
                    ? "border-border text-foreground"
                    : "text-muted-foreground/50 border-transparent line-through",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Grade */}
        <div>
          <div className="text-muted-foreground mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div
            key={`${view}-${dayKey(visibleDays[0]!)}`}
            className="aq-animate-fade grid grid-cols-7 gap-1"
          >
            {visibleDays.map((day) => {
              const key = dayKey(day);
              const dayEvents = eventsByDay.get(key) ?? [];
              const inMonth = view === "week" || isSameMonth(day, cursor);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selected);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(day)}
                  aria-label={formatDate(day.toISOString())}
                  className={cn(
                    "border-border bg-background flex flex-col gap-1 rounded-lg border p-1.5 text-left transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-sm active:translate-y-0",
                    view === "week" ? "min-h-28" : "min-h-20",
                    !inMonth && "opacity-40",
                    isSelected && "ring-2 ring-cyan-400",
                  )}
                >
                  <span
                    className={cn(
                      "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                      isToday
                        ? "bg-cyan-500 text-white"
                        : "text-muted-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="flex flex-col gap-0.5">
                    {dayEvents
                      .slice(0, view === "week" ? 4 : 2)
                      .map((event) => (
                        <span
                          key={event.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[10px] font-medium",
                            event.overdue
                              ? "bg-red-500/15 text-red-600 dark:text-red-300"
                              : TYPE_META[event.type].chip,
                          )}
                        >
                          {event.title}
                        </span>
                      ))}
                    {dayEvents.length > (view === "week" ? 4 : 2) ? (
                      <span className="text-muted-foreground px-1 text-[10px]">
                        +{dayEvents.length - (view === "week" ? 4 : 2)}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista do dia selecionado */}
        <aside className="border-border bg-background flex max-h-[24rem] min-h-0 flex-col overflow-hidden rounded-xl border p-3 lg:max-h-[30rem]">
          {/* `key` por dia faz a lista refazer o fade ao trocar de data. */}
          <div
            key={selectedKey}
            className="aq-animate-fade flex min-h-0 flex-1 flex-col"
          >
            <p className="text-foreground mb-3 shrink-0 text-sm font-semibold capitalize">
              {format(selected, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>

            {selectedEvents.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-xs">
                Nenhum evento neste dia.
              </p>
            ) : (
              <ul className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                {selectedEvents.map((event, index) => {
                  const meta = TYPE_META[event.type];
                  return (
                    <li
                      key={event.id}
                      style={{ animationDelay: `${index * 45}ms` }}
                      className="border-border aq-animate-fade-up rounded-lg border p-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                            meta.chip,
                          )}
                        >
                          <Icon
                            icon={meta.icon}
                            aria-hidden
                            className="h-3.5 w-3.5"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-medium">
                            {event.title}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {event.amount !== undefined
                              ? formatCurrency(event.amount)
                              : event.subtitle}
                          </p>
                          {event.overdue ? (
                            <span className="mt-0.5 inline-block text-[10px] font-semibold text-red-500">
                              Em atraso
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {event.type === "delivery" ? (
                          <>
                            <button
                              type="button"
                              disabled={
                                confirmingId === event.id ||
                                isFutureDate(event.date)
                              }
                              title={
                                isFutureDate(event.date)
                                  ? "Só é possível confirmar a partir da data prevista"
                                  : undefined
                              }
                              onClick={() =>
                                setPending({ event, kind: "delivery" })
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white transition duration-150 hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                            >
                              <Icon
                                icon={Icons.check}
                                aria-hidden
                                className="h-3.5 w-3.5"
                              />
                              Confirmar entrega
                            </button>
                            {isFutureDate(event.date) ? (
                              <button
                                type="button"
                                onClick={() => setRescheduleTarget(event)}
                                className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 px-2 py-1 text-[11px] font-semibold text-cyan-500 transition duration-150 hover:bg-cyan-500/10 active:scale-95"
                              >
                                <Icon
                                  icon={Icons.calendarMark}
                                  aria-hidden
                                  className="h-3.5 w-3.5"
                                />
                                Reagendar
                              </button>
                            ) : null}
                          </>
                        ) : null}
                        {event.type === "receivable" ? (
                          <button
                            type="button"
                            disabled={confirmingId === event.id}
                            onClick={() =>
                              setPending({ event, kind: "receivable" })
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white transition duration-150 hover:bg-emerald-600 active:scale-95 disabled:opacity-60"
                          >
                            <Icon
                              icon={Icons.check}
                              aria-hidden
                              className="h-3.5 w-3.5"
                            />
                            Registrar pagamento
                          </button>
                        ) : null}
                        {event.type === "penalty" ? (
                          <Link
                            href="/reports/penalties"
                            className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition"
                          >
                            Ver multa
                          </Link>
                        ) : null}
                        <Link
                          href={`/plans/${event.planId}`}
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-1 py-1 text-[11px] font-medium transition"
                        >
                          Ver plano
                          <Icon
                            icon={Icons.arrowRight}
                            aria-hidden
                            className="h-3 w-3"
                          />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.kind === "receivable"
            ? "Registrar pagamento?"
            : "Confirmar entrega?"
        }
        description={
          pending
            ? pending.kind === "receivable"
              ? `Confirmar o recebimento de ${formatCurrency(pending.event.amount ?? 0)} de ${pending.event.title}. Registro manual, conforme processo da distribuidora.`
              : `Confirmar a entrega de ${pending.event.title} prevista para ${formatDate(pending.event.date)}.`
            : undefined
        }
        confirmLabel={
          pending?.kind === "receivable"
            ? "Registrar pagamento"
            : "Confirmar entrega"
        }
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <ReasonDialog
        title="Reagendar entrega"
        description={
          rescheduleTarget
            ? `Selecione uma nova data (máximo ${MAX_POSTPONE_DAYS} dias após ${formatDate(rescheduleTarget.date)}).`
            : undefined
        }
        open={rescheduleTarget !== null}
        isPending={reschedulePending}
        schema={rescheduleDeliverySchema}
        showDateField
        submitLabel="Reagendar"
        onConfirm={handleReschedule}
        onCancel={() => setRescheduleTarget(null)}
      />
    </HomeSection>
  );
}
