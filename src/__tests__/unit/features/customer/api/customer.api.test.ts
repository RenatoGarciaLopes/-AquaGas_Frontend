import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/server-fetch", () => ({
  serverFetch: vi.fn(),
}));

import { customer } from "@/__tests__/mocks/builders";
import { serverFetch } from "@/shared/api/server-fetch";
import {
  getCustomerById,
  listCustomers,
} from "@/features/customer/api/customer.api";

const serverFetchMock = vi.mocked(serverFetch);

const CUSTOMERS = [
  customer({ document: "52998224725", id: "c1", name: "Ana Maria" }),
  customer({
    document: "11222333000181",
    id: "c2",
    name: "Mercado Central",
    typeDocument: "PJ",
  }),
];

describe("customer.api", () => {
  beforeEach(() => {
    serverFetchMock.mockReset();
  });

  it("filtra por tipo, busca textual e ordena", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: CUSTOMERS,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listCustomers({
      pageNumber: 1,
      pageSize: 10,
      search: "mercado",
      sort: "name:asc",
      type: "PJ",
    });

    expect(serverFetchMock).toHaveBeenCalledWith("/api/customers");
    expect(result.data.map((item) => item.id)).toEqual(["c2"]);
  });

  it("busca por documento numérico", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: CUSTOMERS,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listCustomers({
      pageNumber: 1,
      pageSize: 10,
      search: "529.982",
    });

    expect(result.data.map((item) => item.id)).toEqual(["c1"]);
  });

  it("mapeia NOT_FOUND ao buscar por id", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: null,
      error: { code: "NOT_FOUND", message: "Cliente não encontrado." },
      success: false,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(getCustomerById("missing")).rejects.toMatchObject({
      status: 404,
    });
  });
});
