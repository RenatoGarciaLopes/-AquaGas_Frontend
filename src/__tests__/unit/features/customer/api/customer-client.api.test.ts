import { it, vi, expect, describe, beforeEach } from "vitest";

import type { RegisterCustomerInput } from "@/features/customer/types";

// Mock do api client compartilhado — o teste foca em verificar o contrato
// (URL + payload) que o feature usa contra o Route Handler do Next.
vi.mock("@/shared/api/client", () => ({
  apiPatch: vi.fn(),
  apiPost: vi.fn(),
}));

import { apiPost, apiPatch } from "@/shared/api/client";

import {
  createCustomer,
  updateCustomer,
} from "@/features/customer/api/customer-client.api";

const apiPatchMock = vi.mocked(apiPatch);
const apiPostMock = vi.mocked(apiPost);

const SAMPLE_INPUT: RegisterCustomerInput = {
  address: {
    cep: "12345678",
    city: "São Paulo",
    complement: null,
    neighborhood: "Centro",
    number: "123",
    street: "Rua das Águas",
  },
  document: "52998224725",
  email: "cliente@example.com",
  name: "Maria Silva",
  phone: "11999998888",
};

describe("createCustomer", () => {
  beforeEach(() => {
    apiPatchMock.mockReset();
    apiPostMock.mockReset();
  });

  it("POSTs em /api/customers — Route Handler precisa expor POST", () => {
    // Regressão direta do bug 405: se alguém trocar a URL aqui sem mexer
    // no Route Handler (ou vice-versa), esse teste falha imediatamente.
    apiPostMock.mockResolvedValueOnce({
      data: { id: "x" },
      error: null,
      success: true,
      timestamp: "2026-05-23T00:00:00.000Z",
    });

    void createCustomer(SAMPLE_INPUT);

    expect(apiPostMock).toHaveBeenCalledTimes(1);
    expect(apiPostMock).toHaveBeenCalledWith("/api/customers", SAMPLE_INPUT);
  });

  it("retorna o envelope ApiResponse vindo do api client", async () => {
    const envelope = {
      data: { id: "new-id" },
      error: null,
      success: true as const,
      timestamp: "2026-05-23T00:00:00.000Z",
    };
    apiPostMock.mockResolvedValueOnce(envelope);

    const result = await createCustomer(SAMPLE_INPUT);
    expect(result).toEqual(envelope);
  });

  it("propaga erros do api client (ex.: ApiError 409)", async () => {
    apiPostMock.mockRejectedValueOnce(new Error("Conflict."));

    await expect(createCustomer(SAMPLE_INPUT)).rejects.toThrow("Conflict.");
  });
});

describe("updateCustomer", () => {
  beforeEach(() => {
    apiPatchMock.mockReset();
    apiPostMock.mockReset();
  });

  it("PATCHs em /api/customers/{id} com payload parcial", () => {
    apiPatchMock.mockResolvedValueOnce({
      data: { id: "customer-id" },
      error: null,
      success: true,
      timestamp: "2026-05-23T00:00:00.000Z",
    });

    void updateCustomer("customer-id", {
      document: "52998224725",
      name: "Maria Silva",
    });

    expect(apiPatchMock).toHaveBeenCalledTimes(1);
    expect(apiPatchMock).toHaveBeenCalledWith("/api/customers/customer-id", {
      document: "52998224725",
      name: "Maria Silva",
    });
  });

  it("inclui addressId quando envia alteração de endereço", () => {
    apiPatchMock.mockResolvedValueOnce({
      data: { id: "customer-id" },
      error: null,
      success: true,
      timestamp: "2026-05-23T00:00:00.000Z",
    });

    void updateCustomer("customer-id", {
      address: {
        addressId: "address-id",
        cep: "12345678",
        city: "São Paulo",
        complement: null,
        neighborhood: "Centro",
        number: "123",
        street: "Rua das Águas",
      },
      email: "cliente@example.com",
      phone: "11999998888",
    });

    expect(apiPatchMock).toHaveBeenCalledWith(
      "/api/customers/customer-id",
      expect.objectContaining({
        address: expect.objectContaining({ addressId: "address-id" }),
      }),
    );
  });
});
