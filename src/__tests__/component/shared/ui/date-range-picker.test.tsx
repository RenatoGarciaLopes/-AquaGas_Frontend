import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

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
      onClick={() => onChange(label === "De" ? "2026-06-10" : "2026-04-01")}
    >
      {label} {value}
    </button>
  ),
}));

import { renderWithProviders } from "@/__tests__/test-utils";
import { DateRangePicker } from "@/shared/ui/date-range-picker";

describe("DateRangePicker", () => {
  it("aplica presets e informa a chave selecionada", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <DateRangePicker
        value={{ end: "2026-05-31", start: "2026-05-01" }}
        presets={[
          {
            key: "last7",
            label: "Últimos 7 dias",
            range: () => ({ end: "2026-05-29", start: "2026-05-23" }),
          },
        ]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /personalizado/i }));
    fireEvent.click(screen.getByRole("button", { name: "Últimos 7 dias" }));

    expect(onChange).toHaveBeenCalledWith(
      { end: "2026-05-29", start: "2026-05-23" },
      "last7",
    );
  });

  it("corrige intervalos invertidos ao alterar início ou fim", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <DateRangePicker
        value={{ end: "2026-05-31", start: "2026-05-01" }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /de 2026-05-01/i }));
    expect(onChange).toHaveBeenLastCalledWith(
      { end: "2026-06-10", start: "2026-06-10" },
      null,
    );

    fireEvent.click(screen.getByRole("button", { name: /até 2026-05-31/i }));
    expect(onChange).toHaveBeenLastCalledWith(
      { end: "2026-04-01", start: "2026-04-01" },
      null,
    );
  });
});
