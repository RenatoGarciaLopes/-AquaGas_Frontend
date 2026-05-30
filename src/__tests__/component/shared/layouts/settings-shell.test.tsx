import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";
import { SettingsShell } from "@/shared/layouts/settings-shell";

const tabs = [
  { id: "details", label: "Dados" },
  { id: "stock", label: "Estoque" },
];

describe("SettingsShell", () => {
  it("renderiza índice mobile e aciona a troca de seção", () => {
    const onTabChange = vi.fn();

    renderWithProviders(
      <SettingsShell
        activeTab="details"
        tabs={tabs}
        onTabChange={onTabChange}
        mobileIndex={{
          description: "Escolha uma área para ajustar.",
          onBackToIndex: vi.fn(),
          showIndex: true,
        }}
      >
        <p>Conteúdo da seção</p>
      </SettingsShell>,
    );

    expect(screen.getByText("O que deseja editar?")).toBeInTheDocument();
    expect(
      screen.getByText("Escolha uma área para ajustar."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Estoque" })[0]!);

    expect(onTabChange).toHaveBeenCalledWith("stock");
  });

  it("renderiza link de retorno quando o conteúdo mobile está ativo", () => {
    const onBackToIndex = vi.fn();

    renderWithProviders(
      <SettingsShell
        activeTab="stock"
        tabs={tabs}
        onTabChange={vi.fn()}
        mobileIndex={{
          onBackToIndex,
          showIndex: false,
        }}
      >
        <p>Controle de estoque</p>
      </SettingsShell>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /voltar para seções/i }),
    );

    expect(onBackToIndex).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Controle de estoque").length).toBeGreaterThan(
      0,
    );
  });
});
