import { apiPost, apiPatch } from "@/shared/api/client";

import type { ApiResponse } from "@/shared/types/api";

import type {
  PlanResponse,
  RegisterPlanInput,
  UpgradePlanInput,
  UpgradePlanResponse,
  DowngradePlanInput,
  DowngradePlanResponse,
  SuspendPlanInput,
  SuspendPlanResponse,
  ReactivatePlanResponse,
  CancelPlanInput,
  CancelPlanResponse,
  ConfirmDeliveryInput,
  ConfirmDeliveryResponse,
  CancelDeliveryInput,
  CancelDeliveryResponse,
  RescheduleDeliveryInput,
  RescheduleDeliveryResponse,
  ConfirmBillingPaymentInput,
  ConfirmBillingPaymentResponse,
  ConfirmPenaltyPaymentResponse,
  WaivePenaltyInput,
  WaivePenaltyResponse,
  CancelPenaltyInput,
  CancelPenaltyResponse,
} from "@/features/plan/types";

// ─── Plan CRUD ──────────────────────────────────────────────────────────────

export async function createPlan(input: RegisterPlanInput) {
  return apiPost<ApiResponse<PlanResponse>, RegisterPlanInput>(
    "/api/plans",
    input,
  );
}

// ─── Plan Lifecycle ─────────────────────────────────────────────────────────

export async function upgradePlan(id: string, input: UpgradePlanInput) {
  return apiPatch<ApiResponse<UpgradePlanResponse>, UpgradePlanInput>(
    `/api/plans/${encodeURIComponent(id)}/upgrade`,
    input,
  );
}

export async function downgradePlan(id: string, input: DowngradePlanInput) {
  return apiPatch<ApiResponse<DowngradePlanResponse>, DowngradePlanInput>(
    `/api/plans/${encodeURIComponent(id)}/downgrade`,
    input,
  );
}

export async function suspendPlan(id: string, input: SuspendPlanInput) {
  return apiPatch<ApiResponse<SuspendPlanResponse>, SuspendPlanInput>(
    `/api/plans/${encodeURIComponent(id)}/suspend`,
    input,
  );
}

export async function reactivatePlan(id: string) {
  return apiPatch<ApiResponse<ReactivatePlanResponse>>(
    `/api/plans/${encodeURIComponent(id)}/reactivate`,
  );
}

export async function cancelPlan(id: string, input: CancelPlanInput) {
  return apiPatch<ApiResponse<CancelPlanResponse>, CancelPlanInput>(
    `/api/plans/${encodeURIComponent(id)}/cancel`,
    input,
  );
}

// ─── Delivery Actions ───────────────────────────────────────────────────────

export async function confirmDelivery(input: ConfirmDeliveryInput) {
  return apiPatch<ApiResponse<ConfirmDeliveryResponse>, ConfirmDeliveryInput>(
    "/api/plans/confirm-delivery",
    input,
  );
}

export async function cancelDelivery(input: CancelDeliveryInput) {
  return apiPatch<ApiResponse<CancelDeliveryResponse>, CancelDeliveryInput>(
    "/api/plans/cancel-delivery",
    input,
  );
}

export async function rescheduleDelivery(input: RescheduleDeliveryInput) {
  return apiPatch<
    ApiResponse<RescheduleDeliveryResponse>,
    RescheduleDeliveryInput
  >("/api/plans/reschedule-delivery", input);
}

// ─── Billing Actions ────────────────────────────────────────────────────────

export async function confirmBillingPayment(
  input: ConfirmBillingPaymentInput,
) {
  return apiPatch<
    ApiResponse<ConfirmBillingPaymentResponse>,
    ConfirmBillingPaymentInput
  >("/api/plans/confirm-billing-payment", input);
}

// ─── Penalty Actions ────────────────────────────────────────────────────────

export async function confirmPenaltyPayment(penaltyId: string) {
  return apiPatch<ApiResponse<ConfirmPenaltyPaymentResponse>>(
    `/api/penalties/${encodeURIComponent(penaltyId)}/confirm-payment`,
  );
}

export async function waivePenalty(penaltyId: string, input: WaivePenaltyInput) {
  return apiPatch<ApiResponse<WaivePenaltyResponse>, WaivePenaltyInput>(
    `/api/penalties/${encodeURIComponent(penaltyId)}/waive`,
    input,
  );
}

export async function cancelPenalty(
  penaltyId: string,
  input: CancelPenaltyInput,
) {
  return apiPatch<ApiResponse<CancelPenaltyResponse>, CancelPenaltyInput>(
    `/api/penalties/${encodeURIComponent(penaltyId)}/cancel`,
    input,
  );
}
