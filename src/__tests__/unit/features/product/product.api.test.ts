import { it, vi, expect, describe, beforeEach } from "vitest";

vi.mock("@/shared/api/server-fetch", () => ({
  serverFetch: vi.fn(),
}));

import { serverFetch } from "@/shared/api/server-fetch";

import {
  listProducts,
  getProductById,
} from "@/features/product/api/product.api";

const serverFetchMock = vi.mocked(serverFetch);

const PRODUCTS = [
  { id: "p1", name: "Água 20L", price: 12, quantity: 3, type: "Water" },
  { id: "p2", name: "Gás 13kg", price: 115, quantity: 9, type: "Gas" },
] as const;

describe("product.api", () => {
  beforeEach(() => {
    serverFetchMock.mockReset();
  });

  it("lista produtos com filtro, ordenação e paginação", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: PRODUCTS,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listProducts({
      pageNumber: 1,
      pageSize: 10,
      sort: "price:desc",
      type: "Gas",
    });

    expect(serverFetchMock).toHaveBeenCalledWith("/api/products");
    expect(result.data).toEqual([PRODUCTS[1]]);
  });

  it("busca produto por id codificado", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: PRODUCTS[0],
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(getProductById("p/1")).resolves.toEqual(PRODUCTS[0]);
    expect(serverFetchMock).toHaveBeenCalledWith("/api/products/p%2F1");
  });

  it("mapeia NOT_FOUND para status 404", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: null,
      error: { code: "NOT_FOUND", message: "Produto não encontrado." },
      success: false,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(getProductById("missing")).rejects.toMatchObject({
      status: 404,
    });
  });
});
