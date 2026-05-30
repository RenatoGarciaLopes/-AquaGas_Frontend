import { it, vi, expect, describe, beforeEach } from "vitest";

vi.mock("@/shared/api/server-fetch", () => ({
  serverFetch: vi.fn(),
}));

import { serverFetch } from "@/shared/api/server-fetch";
import {
  apiSuccess,
  salesReport,
  penaltyReport,
  stockMovementReport,
} from "@/__tests__/mocks/builders";

import {
  getSalesReport,
  getPenaltyReport,
  getStockMovementReport,
} from "@/features/report/api/report.api";

const serverFetchMock = vi.mocked(serverFetch);

describe("report.api", () => {
  beforeEach(() => {
    serverFetchMock.mockReset();
  });

  it("envia período inclusivo em ISO para relatório de vendas", async () => {
    serverFetchMock.mockResolvedValueOnce(apiSuccess(salesReport()));

    await expect(
      getSalesReport({ end: "2026-05-31", start: "2026-05-01" }),
    ).resolves.toEqual(salesReport());

    expect(serverFetchMock).toHaveBeenCalledWith("/api/reports/sales", {
      params: {
        end: "2026-05-31T23:59:59.999Z",
        start: "2026-05-01T00:00:00.000Z",
      },
    });
  });

  it("chama endpoints de estoque e multas com os mesmos limites inclusivos", async () => {
    serverFetchMock
      .mockResolvedValueOnce(apiSuccess(stockMovementReport()))
      .mockResolvedValueOnce(apiSuccess(penaltyReport()));

    await getStockMovementReport({
      end: "2026-05-31",
      start: "2026-05-01",
    });
    await getPenaltyReport({ end: "2026-05-31", start: "2026-05-01" });

    expect(serverFetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/reports/stock-movements",
      {
        params: {
          end: "2026-05-31T23:59:59.999Z",
          start: "2026-05-01T00:00:00.000Z",
        },
      },
    );
    expect(serverFetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/reports/contract-penalties",
      {
        params: {
          end: "2026-05-31T23:59:59.999Z",
          start: "2026-05-01T00:00:00.000Z",
        },
      },
    );
  });

  it("lança ApiError quando o envelope vem sem sucesso ou sem data", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: null,
      error: { code: "HTTP_500", message: "Falha" },
      success: false,
      timestamp: "2026-05-26T00:00:00.000Z",
    });

    await expect(
      getSalesReport({ end: "2026-05-31", start: "2026-05-01" }),
    ).rejects.toMatchObject({
      message: "Falha",
      status: 500,
    });
  });
});
