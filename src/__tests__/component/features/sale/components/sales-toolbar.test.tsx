import { act } from "react";
import { screen, fireEvent } from "@testing-library/react";
import { it, vi, expect, describe, afterEach, beforeEach } from "vitest";

const { replaceMock, searchParamsMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  searchParamsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/sales",
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsMock(),
}));

vi.mock("@/shared/ui/date-picker", () => ({
  DatePicker: ({
    label,
    onChange,
    value,
  }: {
    label: string;
    onChange: (value: string) => void;
    value?: string;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange(label === "Data inicial" ? "2026-05-01" : "2026-05-31")
      }
    >
      {label} {value}
    </button>
  ),
}));

import { renderWithProviders } from "@/__tests__/test-utils";

import { SalesToolbar } from "@/features/sale/components/sales-toolbar";

describe("SalesToolbar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replaceMock.mockReset();
    searchParamsMock.mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounceia busca e filtros de valor", async () => {
    renderWithProviders(<SalesToolbar />);

    fireEvent.change(screen.getByLabelText("Buscar venda"), {
      target: { value: " Maria " },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(replaceMock).toHaveBeenCalledWith("/sales?search=Maria", {
      scroll: false,
    });

    fireEvent.click(screen.getByRole("button", { name: /filtros avançados/i }));
    fireEvent.change(screen.getByLabelText("Valor mínimo"), {
      target: { value: "1000" },
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(replaceMock).toHaveBeenLastCalledWith("/sales?minTotal=10", {
      scroll: false,
    });
  });

  it("preserva chips, remove filtro individual e limpa todos", () => {
    searchParamsMock.mockReturnValue(
      new URLSearchParams(
        "search=Maria&status=Finished&dateFrom=2026-05-01&minTotal=10",
      ),
    );

    renderWithProviders(<SalesToolbar />);

    expect(screen.getByText('"Maria"')).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remover filtro: Finalizada" }),
    ).toBeInTheDocument();
    expect(screen.getByText("De: 01/05/2026")).toBeInTheDocument();
    expect(screen.getByText(/Mín: R\$\s*10,00/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remover filtro: Finalizada" }),
    );
    expect(replaceMock).toHaveBeenCalledWith(
      "/sales?search=Maria&dateFrom=2026-05-01&minTotal=10",
      { scroll: false },
    );

    fireEvent.click(screen.getByRole("button", { name: "Limpar tudo" }));
    expect(replaceMock).toHaveBeenLastCalledWith("/sales", { scroll: false });
  });
});
