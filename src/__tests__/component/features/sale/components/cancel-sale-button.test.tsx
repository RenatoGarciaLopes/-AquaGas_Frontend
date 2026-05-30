import { screen, waitFor, fireEvent } from "@testing-library/react";
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest";

const { refreshMock, cancelSaleMock, toastErrorMock, toastSuccessMock } =
  vi.hoisted(() => ({
    cancelSaleMock: vi.fn(),
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

vi.mock("@/features/sale/api/sale-client.api", () => ({
  cancelSale: cancelSaleMock,
}));

import { ApiError } from "@/shared/api/errors";
import { renderWithProviders } from "@/__tests__/test-utils";

import { CancelSaleButton } from "@/features/sale/components/cancel-sale-button";

describe("CancelSaleButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00.000Z"));
    refreshMock.mockReset();
    cancelSaleMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("desabilita cancelamento fora da janela de 24h", () => {
    renderWithProviders(
      <CancelSaleButton saleId="sale-old" createdAt="2026-05-27T11:59:00Z" />,
    );
    vi.useRealTimers();

    expect(
      screen.getByRole("button", { name: "Cancelar venda" }),
    ).toBeDisabled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("valida motivo obrigatório e cancela venda recente com refresh", async () => {
    cancelSaleMock.mockResolvedValueOnce({ id: "sale-id", status: "Canceled" });

    renderWithProviders(
      <CancelSaleButton
        saleId="sale-id"
        createdAt="2026-05-29T10:00:00.000Z"
      />,
    );
    vi.useRealTimers();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar venda" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Cancelar venda" })[1]!,
    );

    expect(
      await screen.findByText("O motivo deve ter pelo menos 2 caracteres."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/motivo do cancelamento/i), {
      target: { value: "Erro no pedido" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Cancelar venda" })[1]!,
    );

    await waitFor(() => {
      expect(cancelSaleMock).toHaveBeenCalledWith("sale-id", {
        reason: "Erro no pedido",
      });
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Venda cancelada com sucesso.",
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("fecha o diálogo e mostra toast quando backend retorna 409", async () => {
    cancelSaleMock.mockRejectedValueOnce(
      new ApiError({
        code: "CONFLICT",
        message: "Venda fora da janela de cancelamento.",
        status: 409,
      }),
    );

    renderWithProviders(
      <CancelSaleButton
        saleId="sale-id"
        createdAt="2026-05-29T10:00:00.000Z"
      />,
    );
    vi.useRealTimers();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar venda" }));
    fireEvent.change(screen.getByLabelText(/motivo do cancelamento/i), {
      target: { value: "Erro no pedido" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Cancelar venda" })[1]!,
    );

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Venda fora da janela de cancelamento.",
      );
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
