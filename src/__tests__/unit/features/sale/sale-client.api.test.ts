import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  apiPost: vi.fn(),
}));

import { ApiError } from "@/shared/api/errors";
import { apiPost } from "@/shared/api/client";
import { cancelSale, registerSale } from "@/features/sale/api/sale-client.api";

const apiPostMock = vi.mocked(apiPost);

describe("sale-client.api", () => {
  beforeEach(() => {
    apiPostMock.mockReset();
  });

  it("registra venda no endpoint correto e desempacota data", async () => {
    const sale = { id: "s1" };
    apiPostMock.mockResolvedValueOnce({
      data: sale,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(
      registerSale({
        customerId: null,
        discount: null,
        saleItems: [{ productId: "p1", quantity: 1 }],
      }),
    ).resolves.toEqual(sale);

    expect(apiPostMock).toHaveBeenCalledWith("/api/sales/register", {
      customerId: null,
      discount: null,
      saleItems: [{ productId: "p1", quantity: 1 }],
    });
  });

  it("cancela venda com id codificado", async () => {
    const response = { reason: "erro", saleId: "s/1", status: "Canceled" };
    apiPostMock.mockResolvedValueOnce({
      data: response,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(cancelSale("s/1", { reason: "erro" })).resolves.toEqual(
      response,
    );
    expect(apiPostMock).toHaveBeenCalledWith("/api/sales/s%2F1/cancel", {
      reason: "erro",
    });
  });

  it("lança ApiError quando envelope não tem data", async () => {
    apiPostMock.mockResolvedValueOnce({
      data: null,
      error: { code: "NOT_FOUND", message: "Venda não encontrada." },
      success: false,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(
      cancelSale("missing", { reason: "erro" }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
