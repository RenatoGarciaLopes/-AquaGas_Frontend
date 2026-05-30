import { it, vi, expect, describe, beforeEach } from "vitest";

vi.mock("@/shared/api/server-fetch", () => ({
  serverFetch: vi.fn(),
}));

import { serverFetch } from "@/shared/api/server-fetch";

import { listPlans, getPlanById } from "@/features/plan/api/plan.api";

const serverFetchMock = vi.mocked(serverFetch);

const PLANS = [
  {
    billingDay: 10,
    billings: [],
    customerId: "c1",
    customerName: "Ana",
    cycle: "Monthly",
    deliveries: [],
    deliveryDay: 5,
    discount: null,
    document: "52998224725",
    employeeId: "e1",
    employeeName: "Bruno",
    endDate: "2026-12-31",
    id: "p1",
    items: [],
    penalties: [],
    startDate: "2026-01-01",
    status: "Active",
    total: 100,
    warning: null,
  },
  {
    billingDay: 15,
    billings: [],
    customerId: "c2",
    customerName: "Carla",
    cycle: "Annual",
    deliveries: [],
    deliveryDay: 7,
    discount: 5,
    document: "12345678000195",
    employeeId: "e2",
    employeeName: "Daniel",
    endDate: "2026-12-31",
    id: "p2",
    items: [],
    penalties: [],
    startDate: "2026-02-01",
    status: "Suspended",
    total: 1000,
    warning: null,
  },
] as const;

describe("plan.api", () => {
  beforeEach(() => {
    serverFetchMock.mockReset();
  });

  it("filtra por busca, status e ciclo", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: PLANS,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listPlans({
      cycle: "Annual",
      pageNumber: 1,
      pageSize: 10,
      search: "carla",
      status: "Suspended",
    });

    expect(serverFetchMock).toHaveBeenCalledWith("/api/plans");
    expect(result.data.map((plan) => plan.id)).toEqual(["p2"]);
  });

  it("ordena e pagina planos", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: PLANS,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listPlans({
      pageNumber: 1,
      pageSize: 1,
      sort: "total:desc",
    });

    expect(result.data[0]?.id).toBe("p2");
    expect(result.totalPages).toBe(2);
  });

  it("busca plano por id e mapeia NOT_FOUND", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: null,
      error: { code: "NOT_FOUND", message: "Plano não encontrado." },
      success: false,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(getPlanById("missing")).rejects.toMatchObject({
      status: 404,
    });
  });
});
