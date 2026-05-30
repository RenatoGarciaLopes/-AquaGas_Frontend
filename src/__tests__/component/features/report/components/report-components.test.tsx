import { screen, fireEvent } from "@testing-library/react";
import { it, vi, expect, describe, beforeEach } from "vitest";

const { pushMock, searchParamsMock, downloadCsvMock } = vi.hoisted(() => ({
  downloadCsvMock: vi.fn(),
  pushMock: vi.fn(),
  searchParamsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/reports/sales",
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsMock(),
}));

vi.mock("@/shared/lib/csv", () => ({
  downloadCsv: downloadCsvMock,
}));

import { salesReport } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";

import { FilterSelect } from "@/features/report/components/filter-select";
import { SalesReportView } from "@/features/report/components/sales-report-view";

describe("report filters", () => {
  beforeEach(() => {
    pushMock.mockReset();
    searchParamsMock.mockReturnValue(new URLSearchParams("start=2026-05-01"));
  });

  it("preserva parâmetros existentes ao trocar filtro", () => {
    renderWithProviders(
      <FilterSelect
        paramKey="status"
        placeholder="Status"
        value={undefined}
        options={[{ label: "Finalizada", value: "FINISHED" }]}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "FINISHED" },
    });

    expect(pushMock).toHaveBeenCalledWith(
      "/reports/sales?start=2026-05-01&status=FINISHED",
      { scroll: false },
    );
  });
});

describe("SalesReportView", () => {
  beforeEach(() => {
    downloadCsvMock.mockReset();
  });

  it("filtra linhas por status/tipo e exporta CSV com período no nome", () => {
    const report = salesReport();

    renderWithProviders(
      <SalesReportView
        items={report.items}
        status="FINISHED"
        type="SALE"
        start="2026-05-01"
        end="2026-05-31"
      />,
    );

    expect(screen.getByText("Avulsa")).toBeInTheDocument();
    expect(screen.queryByText("Contrato")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect(downloadCsvMock).toHaveBeenCalledWith(
      [report.items[0]],
      expect.any(Array),
      "vendas_2026-05-01_a_2026-05-31.csv",
    );
  });

  it("mostra empty state e desabilita exportação quando filtros removem tudo", () => {
    const report = salesReport();

    renderWithProviders(
      <SalesReportView
        items={report.items}
        status="CANCELLED"
        type="SALE"
        start="2026-05-01"
        end="2026-05-31"
      />,
    );

    expect(screen.getByText("Nenhuma venda encontrada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeDisabled();
  });
});
