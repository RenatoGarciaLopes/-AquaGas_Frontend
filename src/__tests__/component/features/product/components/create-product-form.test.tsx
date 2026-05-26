import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/shared/api/client", () => ({
  apiPost: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { ApiError } from "@/shared/api/errors";
import { apiPost } from "@/shared/api/client";
import { renderWithProviders } from "@/__tests__/test-utils";
import { CreateProductForm } from "@/features/product/components/create-product-form";

const apiPostMock = vi.mocked(apiPost);

function fillStep0() {
  fireEvent.input(screen.getByLabelText(/nome do produto/i), {
    target: { value: "Água Mineral 20L" },
  });
  fireEvent.click(screen.getByRole("button", { name: /água/i }));
}

async function goToStep1() {
  fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
  await waitFor(() => {
    expect(screen.getByLabelText(/preço unitário/i)).toBeInTheDocument();
  });
}

describe("CreateProductForm", () => {
  beforeEach(() => {
    apiPostMock.mockReset();
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it("bloqueia avanço com identificação inválida sem chamar API", async () => {
    renderWithProviders(<CreateProductForm />);

    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/preço unitário/i),
      ).not.toBeInTheDocument();
    });
    expect(apiPostMock).not.toHaveBeenCalled();
  });

  it("envia produto válido para /api/products", async () => {
    apiPostMock.mockResolvedValueOnce({ success: true });

    renderWithProviders(<CreateProductForm />);

    fillStep0();
    await goToStep1();

    fireEvent.input(screen.getByLabelText(/preço unitário/i), {
      target: { value: "1250" },
    });
    fireEvent.input(screen.getByLabelText(/quantidade inicial/i), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar produto/i }));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledTimes(1);
    });
    expect(apiPostMock).toHaveBeenCalledWith("/api/products", {
      name: "Água Mineral 20L",
      price: 12.5,
      quantity: 3,
      type: "Water",
    });
    expect(pushMock).toHaveBeenCalledWith("/products");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("aplica erro 409 no campo name e volta ao passo de identificação", async () => {
    apiPostMock.mockRejectedValueOnce(
      new ApiError({
        fieldErrors: { name: ["Produto já cadastrado."] },
        message: "Conflito",
        status: 409,
      }),
    );

    renderWithProviders(<CreateProductForm />);

    fillStep0();
    await goToStep1();

    fireEvent.input(screen.getByLabelText(/preço unitário/i), {
      target: { value: "1250" },
    });
    fireEvent.input(screen.getByLabelText(/quantidade inicial/i), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar produto/i }));

    await waitFor(() => {
      expect(screen.getByText(/produto já cadastrado/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/nome do produto/i)).toBeInTheDocument();
  });
});
