import { it, vi, expect, describe, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";

const { refreshMock, apiPatchMock, toastErrorMock, toastSuccessMock } =
  vi.hoisted(() => ({
    apiPatchMock: vi.fn(),
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

vi.mock("@/shared/api/client", () => ({
  apiPatch: apiPatchMock,
}));

import { ApiError } from "@/shared/api/errors";
import { product } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";

import { StockAdjustmentSection } from "@/features/product/components/stock-adjustment-section";
import { EditProductDetailsSection } from "@/features/product/components/edit-product-details-section";

describe("product edit and stock sections", () => {
  beforeEach(() => {
    apiPatchMock.mockReset();
    refreshMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it("habilita salvar apenas quando há alteração e envia PATCH dos detalhes", async () => {
    apiPatchMock.mockResolvedValueOnce({});

    renderWithProviders(
      <EditProductDetailsSection product={product({ quantity: 0 })} />,
    );

    expect(
      screen.getByRole("button", { name: /salvar alterações/i }),
    ).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/nome do produto/i), {
      target: { value: "Água Premium 20L" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(apiPatchMock).toHaveBeenCalledWith("/api/products/product-id", {
        name: "Água Premium 20L",
        price: 12.5,
        type: "Water",
      });
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Dados do produto atualizados.",
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("bloqueia alteração de tipo quando há estoque", () => {
    renderWithProviders(
      <EditProductDetailsSection product={product({ quantity: 10 })} />,
    );

    expect(screen.getByRole("button", { name: /gás/i })).toBeDisabled();
    expect(
      screen.getAllByText("Zere o estoque para alterar o tipo do produto.")
        .length,
    ).toBeGreaterThan(0);
  });

  it("mostra erro de estoque insuficiente no campo quantity", async () => {
    apiPatchMock.mockRejectedValueOnce(
      new ApiError({
        code: "INSUFFICIENT_STOCK",
        message: "Estoque insuficiente. Atual: 2",
        status: 409,
      }),
    );

    renderWithProviders(
      <StockAdjustmentSection product={product({ quantity: 2 })} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /saída/i }));
    fireEvent.change(
      screen.getByLabelText(/quantidade/i, { selector: "input" }),
      {
        target: { value: "3" },
      },
    );
    fireEvent.change(screen.getByLabelText(/motivo/i), {
      target: { value: "Venda manual" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /registrar movimentação/i }),
    );

    expect(
      (await screen.findAllByText("Estoque insuficiente. Atual: 2")).length,
    ).toBeGreaterThan(0);
  });
});
