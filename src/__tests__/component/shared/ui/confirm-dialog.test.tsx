import { screen, fireEvent } from "@testing-library/react";
import { it, vi, expect, describe, beforeEach } from "vitest";

import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { renderWithProviders } from "@/__tests__/test-utils";

describe("ConfirmDialog", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("não renderiza quando fechado", () => {
    renderWithProviders(
      <ConfirmDialog
        open={false}
        title="Confirmar?"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza acessível e chama ações", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    renderWithProviders(
      <ConfirmDialog
        open
        title="Excluir item?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Voltar"
        variant="danger"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Excluir item?");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
