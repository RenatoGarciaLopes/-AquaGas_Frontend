import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  apiPatch: vi.fn(),
  apiPost: vi.fn(),
}));

import { apiPatch, apiPost } from "@/shared/api/client";
import {
  cancelDelivery,
  cancelPenalty,
  cancelPlan,
  confirmBillingPayment,
  confirmDelivery,
  confirmPenaltyPayment,
  createPlan,
  downgradePlan,
  reactivatePlan,
  rescheduleDelivery,
  suspendPlan,
  upgradePlan,
  waivePenalty,
} from "@/features/plan/api/plan-client.api";

const apiPatchMock = vi.mocked(apiPatch);
const apiPostMock = vi.mocked(apiPost);

describe("plan-client.api", () => {
  beforeEach(() => {
    apiPatchMock.mockReset();
    apiPostMock.mockReset();
  });

  it("usa endpoints esperados para criação e ciclo de vida do plano", () => {
    void createPlan({
      billingDay: 10,
      customerId: "c1",
      cycle: "Monthly",
      deliveryDay: 5,
      items: [{ productId: "p1", quantity: 1 }],
    });
    void upgradePlan("plan/1", { reason: "upgrade" });
    void downgradePlan("plan/1", { reason: "downgrade" });
    void suspendPlan("plan/1", { reason: "férias" });
    void reactivatePlan("plan/1");
    void cancelPlan("plan/1", { reason: "cancelamento" });

    expect(apiPostMock).toHaveBeenCalledWith("/api/plans", expect.any(Object));
    expect(apiPatchMock).toHaveBeenCalledWith("/api/plans/plan%2F1/upgrade", {
      reason: "upgrade",
    });
    expect(apiPatchMock).toHaveBeenCalledWith("/api/plans/plan%2F1/downgrade", {
      reason: "downgrade",
    });
    expect(apiPatchMock).toHaveBeenCalledWith("/api/plans/plan%2F1/suspend", {
      reason: "férias",
    });
    expect(apiPatchMock).toHaveBeenCalledWith("/api/plans/plan%2F1/reactivate");
    expect(apiPatchMock).toHaveBeenCalledWith("/api/plans/plan%2F1/cancel", {
      reason: "cancelamento",
    });
  });

  it("usa endpoints esperados para entregas, cobranças e multas", () => {
    void confirmDelivery({ deliveryId: "d1" });
    void cancelDelivery({ deliveryId: "d1", reason: "ausente" });
    void rescheduleDelivery({
      deliveryId: "d1",
      newDate: "2026-06-01",
      reason: "cliente pediu",
    });
    void confirmBillingPayment({ billingId: "b1" });
    void confirmPenaltyPayment("pen/1");
    void waivePenalty("pen/1", { reason: "cortesia" });
    void cancelPenalty("pen/1", { reason: "erro" });

    expect(apiPatchMock).toHaveBeenCalledWith("/api/plans/confirm-delivery", {
      deliveryId: "d1",
    });
    expect(apiPatchMock).toHaveBeenCalledWith("/api/plans/cancel-delivery", {
      deliveryId: "d1",
      reason: "ausente",
    });
    expect(apiPatchMock).toHaveBeenCalledWith(
      "/api/plans/reschedule-delivery",
      {
        deliveryId: "d1",
        newDate: "2026-06-01",
        reason: "cliente pediu",
      },
    );
    expect(apiPatchMock).toHaveBeenCalledWith(
      "/api/plans/confirm-billing-payment",
      { billingId: "b1" },
    );
    expect(apiPatchMock).toHaveBeenCalledWith(
      "/api/penalties/pen%2F1/confirm-payment",
    );
    expect(apiPatchMock).toHaveBeenCalledWith("/api/penalties/pen%2F1/waive", {
      reason: "cortesia",
    });
    expect(apiPatchMock).toHaveBeenCalledWith("/api/penalties/pen%2F1/cancel", {
      reason: "erro",
    });
  });
});
