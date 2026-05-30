import { screen, fireEvent } from "@testing-library/react";
import { it, vi, expect, describe, beforeEach } from "vitest";

const { isMobileMock } = vi.hoisted(() => ({
  isMobileMock: vi.fn(),
}));

vi.mock("@/shared/hooks/use-media-query", () => ({
  useIsMobile: () => isMobileMock(),
}));

import { renderWithProviders } from "@/__tests__/test-utils";
import { ActionOverflowMenu } from "@/shared/ui/action-overflow-menu";

describe("ActionOverflowMenu", () => {
  beforeEach(() => {
    isMobileMock.mockReturnValue(false);
  });

  it("renderiza ações inline no desktop quando renderItem é informado", () => {
    const onSelect = vi.fn();

    renderWithProviders(
      <ActionOverflowMenu
        items={[
          { id: "edit", label: "Editar", onSelect },
          { disabled: true, id: "delete", label: "Excluir", onSelect },
        ]}
        renderItem={(item) => (
          <button key={item.id} type="button" onClick={item.onSelect}>
            {item.label}
          </button>
        )}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Excluir" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mais ações" })).toBeNull();
  });

  it("usa menu em mobile, fecha ao selecionar e respeita itens desabilitados", async () => {
    isMobileMock.mockReturnValue(true);
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <ActionOverflowMenu
        items={[
          { id: "edit", label: "Editar", onSelect: onEdit },
          {
            disabled: true,
            id: "delete",
            label: "Excluir",
            onSelect: onDelete,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mais ações" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Excluir" })).toBeDisabled();

    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
