import { test, expect } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

test.describe("sale cancellation", () => {
  test("gerente cancela venda recente com motivo obrigatório", async ({
    page,
  }) => {
    await loginAs(page, "gerente");
    await page.goto("/sales/sale-1");

    await page.getByRole("button", { name: "Cancelar venda" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Cancelar venda" }).click();
    await expect(
      dialog.getByText("O motivo deve ter pelo menos 2 caracteres."),
    ).toBeVisible();

    await dialog.getByLabel(/motivo do cancelamento/i).fill("Erro no pedido");
    await dialog.getByRole("button", { name: "Cancelar venda" }).click();

    await expect(page.getByText("Venda cancelada com sucesso.")).toBeVisible();
  });
});
