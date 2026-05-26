// ─── Enums ──────────────────────────────────────────────────────────────────

export type PlanCycle = "Annual" | "Custom" | "Monthly" | "Quarterly";

export type PlanStatus =
  | "Active"
  | "AwaitingClosure"
  | "Canceled"
  | "Finished"
  | "Suspended";

export type DeliveryStatus = "Cancelled" | "Delivered" | "Late" | "Pending";

export type BillingStatus = "Cancelled" | "Late" | "Paid" | "Pending";

export type PenaltyType = "Downgrade" | "EarlyCancellation";

export type PenaltyStatus =
  | "Canceled"
  | "Overdue"
  | "Paid"
  | "PendingPayment"
  | "Waived";

// ─── Response Types ─────────────────────────────────────────────────────────

export type PlanItemResponse = {
  productId: string;
  productName: string;
  quantity: number;
};

export type PlanDeliveryResponse = {
  deliveryDate: string | null;
  dueDate: string;
  id: string;
  period: number;
  status: DeliveryStatus;
};

export type PlanBillingResponse = {
  amount: number;
  dueDate: string;
  id: string;
  paidAt: string | null;
  receivedBy: string | null;
  status: BillingStatus;
};

export type PlanPenaltyResponse = {
  calculatedAmount: number;
  cancelReason: string | null;
  canceledAt: string | null;
  canceledBy: string | null;
  dueDate: string;
  id: string;
  notes: string | null;
  originalValue: number;
  paidBy: string | null;
  paidDate: string | null;
  planId: string;
  remainingValue: number;
  status: PenaltyStatus;
  timestamp: string;
  type: PenaltyType;
  waiveReason: string | null;
  waivedAt: string | null;
  waivedBy: string | null;
};

export type PlanResponse = {
  billingDay: number;
  billings: PlanBillingResponse[];
  cycle: PlanCycle;
  customerName: string;
  customerId: string;
  deliveries: PlanDeliveryResponse[];
  deliveryDay: number;
  discount: number | null;
  document: string;
  employeeId: string;
  employeeName: string;
  endDate: string;
  id: string;
  items: PlanItemResponse[];
  penalties: PlanPenaltyResponse[];
  startDate: string;
  status: PlanStatus;
  total: number;
  warning: string | null;
};

// ─── Input Types ────────────────────────────────────────────────────────────

export type PlanItemInput = {
  productId: string;
  quantity: number;
};

export type RegisterPlanInput = {
  billingDay: number;
  customerId: string;
  cycle: PlanCycle;
  deliveryDay: number;
  discount?: number;
  durationInMonths?: number;
  ignoreWarnings?: boolean;
  items: PlanItemInput[];
};

export type UpgradePlanInput = {
  cycle?: PlanCycle;
  durationInMonths?: number;
  items?: PlanItemInput[];
  reason?: string;
};

export type DowngradePlanItemInput = {
  productId: string;
  quantity: number;
};

export type DowngradePlanInput = {
  cycle?: PlanCycle;
  durationInMonths?: number;
  items?: DowngradePlanItemInput[];
  reason: string;
};

export type SuspendPlanInput = {
  reason: string;
};

export type CancelPlanInput = {
  reason?: string;
};

export type ConfirmDeliveryInput = {
  deliveryId: string;
};

export type CancelDeliveryInput = {
  deliveryId: string;
  reason: string;
};

export type RescheduleDeliveryInput = {
  deliveryId: string;
  newDate: string;
  reason: string;
};

export type ConfirmBillingPaymentInput = {
  billingId: string;
};

export type WaivePenaltyInput = {
  reason: string;
};

export type CancelPenaltyInput = {
  reason: string;
};

// ─── Action Response Types ──────────────────────────────────────────────────

export type UpgradePlanResponse = {
  cycle: PlanCycle;
  message: string;
  newTotal: number;
  planId: string;
  previousCycle: PlanCycle;
  previousTotal: number;
  updatedBillings: number;
  updatedDeliveries: number;
  updatedItems: number;
};

export type DowngradePlanResponse = {
  canceledBillings: number;
  canceledDeliveries: number;
  cycle: PlanCycle;
  message: string;
  newTotal: number;
  penalty: PlanPenaltyResponse | null;
  planId: string;
  previousCycle: PlanCycle;
  previousTotal: number;
  removedItems: number;
  summary: string;
  updatedBillings: number;
  updatedDeliveries: number;
  updatedItems: number;
};

export type SuspendPlanResponse = {
  canceledBillings: number;
  canceledDeliveries: number;
  message: string;
  planId: string;
  reason: string | null;
  status: string;
};

export type ReactivatePlanResponse = {
  message: string;
  planId: string;
  rescheduledBillings: number;
  rescheduledDeliveries: number;
  status: string;
};

export type CancelPlanResponse = {
  canceledBillings: number;
  canceledDeliveries: number;
  message: string;
  penalty: PlanPenaltyResponse | null;
  planId: string;
  status: string;
};

export type ConfirmDeliveryResponse = {
  deliveryDate: string | null;
  deliveryId: string;
  message: string;
  status: string;
};

export type CancelDeliveryResponse = {
  deliveryId: string;
  message: string;
  reason: string | null;
  status: string;
};

export type RescheduleDeliveryResponse = {
  deliveryId: string;
  message: string;
  newDate: string;
  previousDate: string;
  status: string;
};

export type ConfirmBillingPaymentResponse = {
  billingId: string;
  message: string;
  paidAt: string | null;
  receivedBy: string | null;
  status: string;
};

export type ConfirmPenaltyPaymentResponse = {
  amount: number;
  message: string;
  paidAt: string | null;
  penaltyId: string;
  status: string;
};

export type WaivePenaltyResponse = {
  amount: number;
  message: string;
  penaltyId: string;
  reason: string;
  status: string;
  waivedAt: string | null;
};

export type CancelPenaltyResponse = {
  amount: number;
  canceledAt: string | null;
  message: string;
  penaltyId: string;
  reason: string;
  status: string;
};

// ─── Query & Pagination ─────────────────────────────────────────────────────

export type PlansQuery = {
  cycle?: PlanCycle;
  pageNumber: number;
  pageSize: number;
  search?: string;
  sort?: string;
  status?: PlanStatus;
};

export type PaginatedPlans = {
  data: PlanResponse[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
