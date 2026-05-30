import { test, expect } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

test.describe("plan flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "gerente");
  });

  test("gerente cria plano e chega ao detalhe com dados principais", async ({
    page,
  }) => {
    await page.goto("/plans/new");

    await page.getByRole("button", { name: /maria silva/i }).click();
    await page.getByRole("button", { name: /próximo/i }).click();
    await expect(page.getByText("Configure o plano")).toBeVisible();

    await page.getByRole("button", { name: /próximo/i }).click();
    await page.getByRole("button", { name: /água mineral 20l/i }).click();
    await page.getByRole("button", { name: "Criar plano" }).click();

    await expect(page).toHaveURL(/\/plans\/plan-created/);
    await expect(
      page.getByRole("heading", { name: /maria silva/i }),
    ).toBeVisible();
    await expect(page.getByText("R$ 120,00").first()).toBeVisible();
  });

  test("detalhe exibe ações de ciclo de vida, entregas e multas por status", async ({
    page,
  }) => {
    await page.goto("/plans/plan-1");

    await expect(page.getByRole("button", { name: "Upgrade" })).toBeVisible();

    // Em mobile (<768px) os itens de ciclo de vida ficam dentro do menu kebab.
    // O viewport do projeto é determinístico; o .click() auto-espera o kebab
    // aparecer após a hidratação (useIsMobile parte de desktop no SSR).
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      await page.getByRole("button", { name: "Mais ações do plano" }).click();
    }

    await expect(
      page
        .getByRole("button", { name: "Downgrade" })
        .or(page.getByRole("menuitem", { name: "Downgrade" })),
    ).toBeVisible();
    await expect(page.getByTitle("Confirmar entrega")).toBeVisible();
    await expect(page.getByTitle("Cancelar entrega")).toBeVisible();
    await expect(page.getByTitle("Confirmar pagamento")).toBeVisible();
    await expect(page.getByTitle("Dispensar multa")).toBeVisible();
  });
});
