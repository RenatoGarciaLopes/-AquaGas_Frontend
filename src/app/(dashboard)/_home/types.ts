// Tipos derivados (view models) da Home. Não espelham um DTO único do backend —
// são o resultado de agregar planos, vendas e produtos no servidor.

export type DeliveryBucket = "overdue" | "today" | "upcoming";

export type HomeDelivery = {
  bucket: DeliveryBucket;
  customerName: string;
  deliveryId: string;
  dueDate: string;
  /** Resumo legível dos itens do plano. Ex.: "2× Água 20L · 1× Gás P13". */
  itemsLabel: string;
  planId: string;
};

export type HomeReceivable = {
  amount: number;
  billingId: string;
  customerName: string;
  dueDate: string;
  /** `true` quando o vencimento já passou (status Late ou dueDate < hoje). */
  overdue: boolean;
  planId: string;
};

export type AttentionSeverity = "danger" | "warning";

/** Um item individual por trás de um alerta, com link para sua tela de detalhe. */
export type AttentionDetail = {
  href: string;
  id: string;
  subtitle?: string;
  title: string;
};

export type AttentionItem = {
  count: number;
  /** Itens individuais exibidos no modal do alerta. */
  details: AttentionDetail[];
  id: string;
  label: string;
  /** Restringe o alerta ao Gerente quando `true`. */
  managerOnly?: boolean;
  severity: AttentionSeverity;
};

export type HomeIndicators = {
  /** Soma de entregas pendentes/atrasadas com vencimento hoje. */
  deliveriesToday: number;
  deliveriesOverdue: number;
  lowStock: number;
  receivablesPending: number;
  receivablesOverdue: number;
  penaltiesPending: number;
  activePlans: number;
  salesTodayCount: number;
  salesTodayTotal: number;
  plansExpiringSoon: number;
};

export type HomeData = {
  attention: AttentionItem[];
  deliveries: HomeDelivery[];
  indicators: HomeIndicators;
  receivables: HomeReceivable[];
};

// ─── Calendário operacional ──────────────────────────────────────────────────

export type CalendarEventType =
  | "delivery"
  | "receivable"
  | "penalty"
  | "expiring";

export type CalendarEvent = {
  /** Valor monetário (recebível/multa), quando aplicável. */
  amount?: number;
  billingId?: string;
  /** Data do evento (ISO). Granularidade de dia — sem horário. */
  date: string;
  deliveryId?: string;
  id: string;
  /** `true` quando o vencimento já passou. */
  overdue: boolean;
  planId: string;
  /** Linha secundária. Ex.: itens da entrega ou descrição. */
  subtitle?: string;
  title: string;
  type: CalendarEventType;
};
