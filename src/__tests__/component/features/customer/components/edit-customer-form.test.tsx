import { it, vi, expect, describe, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/shared/api/client", () => ({
  apiPatch: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/shared/hooks/use-viacep-lookup", () => ({
  useViaCepLookup: () => ({
    error: null,
    lastCep: null,
    lookup: vi.fn(),
    reset: vi.fn(),
    status: "idle" as const,
  }),
}));

import { apiPatch } from "@/shared/api/client";
import { renderWithProviders } from "@/__tests__/test-utils";

import type { CustomerResponse } from "@/features/customer/types";
import { EditCustomerForm } from "@/features/customer/components/edit-customer-form";

const apiPatchMock = vi.mocked(apiPatch);

const CUSTOMER: CustomerResponse = {
  address: {
    cep: "12345678",
    city: "São Paulo",
    complement: null,
    id: "address-id",
    neighborhood: "Centro",
    number: "123",
    street: "Rua das Águas",
  },
  createdAt: "2025-01-01T00:00:00Z",
  document: "52998224725",
  email: "cliente@example.com",
  id: "customer-id",
  name: "Maria Silva",
  phone: "11999998888",
  typeDocument: "PF",
};

describe("EditCustomerForm", () => {
  beforeEach(() => {
    apiPatchMock.mockReset();
  });

  it("popula a aba de identificação com dados existentes", () => {
    renderWithProviders(<EditCustomerForm customer={CUSTOMER} />);

    expect(screen.getByLabelText(/nome/i)).toHaveValue("Maria Silva");
    expect(screen.getByLabelText(/^cpf/i)).toHaveValue("529.982.247-25");
  });

  it("salva identificação com PATCH parcial e documento sem máscara", async () => {
    apiPatchMock.mockResolvedValueOnce({
      data: CUSTOMER,
      error: null,
      success: true,
      timestamp: "2026-05-23T00:00:00.000Z",
    });

    renderWithProviders(<EditCustomerForm customer={CUSTOMER} />);

    fireEvent.input(screen.getByLabelText(/nome/i), {
      target: { value: "Maria Souza" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledTimes(1);
    });

    expect(apiPatchMock).toHaveBeenCalledWith("/api/customers/customer-id", {
      document: "52998224725",
      name: "Maria Souza",
    });
  });

  it("salva contato e endereço incluindo addressId", async () => {
    apiPatchMock.mockResolvedValueOnce({
      data: CUSTOMER,
      error: null,
      success: true,
      timestamp: "2026-05-23T00:00:00.000Z",
    });

    renderWithProviders(<EditCustomerForm customer={CUSTOMER} />);

    fireEvent.click(screen.getByRole("tab", { name: /contato e endereço/i }));
    fireEvent.input(screen.getByLabelText(/telefone/i), {
      target: { value: "(11) 98888-7777" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledTimes(1);
    });

    expect(apiPatchMock).toHaveBeenCalledWith(
      "/api/customers/customer-id",
      expect.objectContaining({
        address: expect.objectContaining({ addressId: "address-id" }),
        email: "cliente@example.com",
        phone: "11988887777",
      }),
    );
  });
});
