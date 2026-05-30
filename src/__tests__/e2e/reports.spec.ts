import { test, expect } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

test.describe("reports", () => {
  test("gerente navega pelos relatórios, filtra vendas e exporta CSV", async ({
    page,
  }) => {
    await loginAs(page, "gerente");

    await page.goto("/reports");
    await expect(
      page.getByRole("heading", { name: "Relatórios" }),
    ).toBeVisible();
    await expect(page.getByText("Receita total")).toBeVisible();

    await page.goto("/reports/sales");
    await page.getByRole("combobox").first().selectOption("FINISHED");
    await expect(page).toHaveURL(/status=FINISHED/);
    await expect(page.getByRole("table").getByText("Avulsa")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exportar CSV" }).click(),
    ]);
    expect(download.suggestedFilename()).toContain("vendas_");

    await page.goto("/reports/stock");
    await expect(page.getByRole("heading", { name: /estoque/i })).toBeVisible();

    await page.goto("/reports/penalties");
    await expect(page.getByRole("heading", { name: /multas/i })).toBeVisible();
  });

  test("funcionário vê bloqueio de relatórios gerenciais", async ({ page }) => {
    await loginAs(page, "funcionario");

    await page.goto("/reports");
    await expect(page.getByText("Acesso restrito")).toBeVisible();
  });
});
