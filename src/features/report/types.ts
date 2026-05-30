// Tipos espelhando os DTOs reais do backend AquaGas.Report.Application.Dtos.Responses.
// Ver: src/Report/AquaGas.Report.Application/Dtos/Responses/*.cs

// ─── Período (filtros comuns) ────────────────────────────────────────────────

export type ReportRangeQuery = {
  /** ISO date `yyyy-MM-dd` (start of day, UTC) */
  start: string;
  /** ISO date `yyyy-MM-dd` (end of day, UTC) */
  end: string;
};

export type PenaltyRangeQuery = Partial<ReportRangeQuery>;

// ─── Sales report ────────────────────────────────────────────────────────────

export type SalesItemType = "SALE" | "PLAN";
export type SalesItemStatus = "FINISHED" | "CANCELLED";

export type SalesPeriod = {
  start: string;
  end: string;
};

export type SalesSummary = {
  totalSpotSales: number;
  totalContractSales: number;
  totalRevenue: number;
  totalSales: number;
  cancelledSales: number;
  averageTicket: number;
  period: SalesPeriod;
};

export type SalesProductItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type ReportEntityRef = {
  id: string;
  name: string;
};

export type SalesReportItem = {
  id: string;
  date: string;
  customer: ReportEntityRef | null;
  employee: ReportEntityRef;
  type: SalesItemType;
  status: SalesItemStatus;
  itemsCount: number;
  total: number;
  items: SalesProductItem[];
};

export type SalesReport = {
  summary: SalesSummary;
  items: SalesReportItem[];
};

// ─── Stock movement report ───────────────────────────────────────────────────

export type StockMovementType = "Entry" | "Exit";

export type StockMovementReference = {
  id: string;
  type: "SALE" | "PLAN";
};

export type StockMovementItem = {
  id: string;
  date: string;
  product: ReportEntityRef;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference: StockMovementReference | null;
  employee: ReportEntityRef;
  customer: ReportEntityRef | null;
};

export type StockMovementReport = {
  items: StockMovementItem[];
};

// ─── Contract penalties report ───────────────────────────────────────────────

export type PenaltyStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "WAIVED"
  | "CANCELED"
  | "OVERDUE";

export type PenaltyType = "DOWNGRADE" | "EARLY_CANCELLATION";

export type PenaltyOriginType = "PLAN_DOWNGRADE" | "PLAN_EARLY_CANCELLATION";

export type PenaltyPlan = {
  id: string;
  status: string;
  cycle: string;
};

export type PenaltyOrigin = {
  type: PenaltyOriginType;
  id: string;
};

export type PenaltyFinancial = {
  originalValue: number;
  remainingValue: number;
  calculatedValue: number;
};

export type PenaltyAudit = {
  canBePaid: boolean;
  canBeWaived: boolean;
  canBeCanceled: boolean;
};

export type PenaltySummary = {
  totalPenalties: number;
  pendingAmount: number;
  paidAmount: number;
  waivedAmount: number;
  overdueAmount: number;
};

export type PenaltyReportItem = {
  id: string;
  date: string;
  plan: PenaltyPlan;
  customer: ReportEntityRef;
  origin: PenaltyOrigin;
  type: PenaltyType;
  financial: PenaltyFinancial;
  status: PenaltyStatus;
  dueDate: string;
  paidAt: string | null;
  notes: string | null;
  createdBy: ReportEntityRef;
  resolvedBy: ReportEntityRef | null;
  audit: PenaltyAudit;
};

export type PenaltyReport = {
  summary: PenaltySummary;
  items: PenaltyReportItem[];
};
