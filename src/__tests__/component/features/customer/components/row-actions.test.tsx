import { it, vi, expect, describe, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";

const {
  refreshMock,
  deactivateCustomerMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  deactivateCustomerMock: vi.fn(),
  refreshMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

vi.mock("@/features/customer/api/customer-client.api", () => ({
  deactivateCustomer: deactivateCustomerMock,
}));

import { customer } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";

import { RowActions } from "@/features/customer/components/row-actions";

describe("customer RowActions", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    deactivateCustomerMock.mockReset();
  });

  it("mantém ações destrutivas ocultas sem permissão gerencial", () => {
    renderWithProviders(<RowActions customer={customer()} canManage={false} />);

    fireEvent.click(screen.getByRole("button", { name: /ações de maria/i }));

    expect(screen.getByRole("menuitem", { name: "Ver" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Editar" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Desativar" })).toBeNull();
  });

  it("confirma desativação, mostra toast e atualiza a página", async () => {
    deactivateCustomerMock.mockResolvedValueOnce({});

    renderWithProviders(<RowActions customer={customer()} canManage />);

    fireEvent.click(screen.getByRole("button", { name: /ações de maria/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Desativar" }));
    fireEvent.click(screen.getByRole("button", { name: "Desativar" }));

    await waitFor(() => {
      expect(deactivateCustomerMock).toHaveBeenCalledWith("customer-id");
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Maria Silva foi desativado com sucesso.",
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
