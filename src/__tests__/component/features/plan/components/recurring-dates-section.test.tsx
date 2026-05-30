import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";

import { RecurringDatesSection } from "@/features/plan/components/recurring-dates-section";

function renderRecurringDatesSection(
  overrides: Partial<{
    billingDay: number;
    deliveryDay: number;
  }> = {},
) {
  const onBillingDayChange = vi.fn();
  const onDeliveryDayChange = vi.fn();

  renderWithProviders(
    <RecurringDatesSection
      deliveryDay={overrides.deliveryDay ?? 10}
      billingDay={overrides.billingDay ?? 15}
      onDeliveryDayChange={onDeliveryDayChange}
      onBillingDayChange={onBillingDayChange}
    />,
  );

  return { onBillingDayChange, onDeliveryDayChange };
}

describe("RecurringDatesSection", () => {
  it("explica os campos e atualiza a seleção dos dias", () => {
    const { onDeliveryDayChange } = renderRecurringDatesSection();

    expect(screen.getByText("Datas recorrentes")).toBeInTheDocument();
    expect(screen.getByText("Entrega")).toBeInTheDocument();
    expect(screen.getByText("Vencimento")).toBeInTheDocument();
    expect(
      screen.getByText(/entrega todo dia 10 e vencimento todo dia 15/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/dia da entrega/i), {
      target: { value: "31" },
    });

    expect(onDeliveryDayChange).toHaveBeenCalledWith(31);
  });

  it("avisa quando o vencimento vem antes da entrega", () => {
    renderRecurringDatesSection({ billingDay: 10, deliveryDay: 20 });

    expect(
      screen.getByText(
        "O vencimento está antes da entrega. Confirme se essa é a regra desejada.",
      ),
    ).toBeInTheDocument();
  });

  it("explica o ajuste para meses sem o dia selecionado", () => {
    renderRecurringDatesSection({ billingDay: 15, deliveryDay: 31 });

    expect(
      screen.getByText(
        "Em meses que não possuem esse dia, será usado o último dia do mês.",
      ),
    ).toBeInTheDocument();
  });
});
