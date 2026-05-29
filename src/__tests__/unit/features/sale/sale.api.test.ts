import { it, vi, expect, describe, beforeEach } from "vitest";

vi.mock("@/shared/api/server-fetch", () => ({
  serverFetch: vi.fn(),
}));

import { serverFetch } from "@/shared/api/server-fetch";

import { listSales, getSaleById } from "@/features/sale/api/sale.api";

const serverFetchMock = vi.mocked(serverFetch);

const SALES = [
  {
    cancelReason: null,
    createdAt: "2026-05-20T10:00:00Z",
    customer: { document: "52998224725", id: "c1", name: "Ana" },
    discount: 0,
    employee: { id: "e1", name: "Bruno" },
    id: "s1",
    items: [],
    status: "Finished",
    subtotal: 100,
    total: 100,
  },
  {
    cancelReason: "erro",
    createdAt: "2026-05-22T10:00:00Z",
    customer: null,
    discount: 10,
    employee: { id: "e2", name: "Carla" },
    id: "s2",
    items: [],
    status: "Canceled",
    subtotal: 200,
    total: 180,
  },
] as const;

describe("sale.api", () => {
  beforeEach(() => {
    serverFetchMock.mockReset();
  });

  it("filtra por status, data, valor e ordena", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: SALES,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listSales({
      dateFrom: "2026-05-21",
      maxTotal: 200,
      pageNumber: 1,
      pageSize: 10,
      sort: "total:desc",
      status: "Canceled",
    });

    expect(serverFetchMock).toHaveBeenCalledWith("/api/sales");
    expect(result.data.map((sale) => sale.id)).toEqual(["s2"]);
  });

  it("busca por cliente ou funcionário", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: SALES,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listSales({
      pageNumber: 1,
      pageSize: 10,
      search: "bruno",
    });

    expect(result.data.map((sale) => sale.id)).toEqual(["s1"]);
  });

  it("busca venda por id e mapeia NOT_FOUND", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: null,
      error: { code: "NOT_FOUND", message: "Venda não encontrada." },
      success: false,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(getSaleById("missing")).rejects.toMatchObject({
      status: 404,
    });
  });
});
