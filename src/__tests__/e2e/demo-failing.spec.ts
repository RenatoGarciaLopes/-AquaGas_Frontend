import { test, expect } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

/**
 * Teste de DEMONSTRAÇÃO — falha de propósito.
 *
 * Serve para mostrar o que o Playwright produz quando uma asserção quebra:
 * - "Call log" com o histórico da espera (auto-waiting até o timeout)
 * - screenshot do momento da falha (screenshot: "only-on-failure")
 * - vídeo da execução (video: "retain-on-failure")
 * - trace navegável (trace: "retain-on-failure" → npx playwright show-trace)
 *
 * Para ver a ferramenta funcionando, rode:
 *   npx playwright test demo-failing --project=chromium
 *   npx playwright show-report
 */
test.describe("demo (falha proposital)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "gerente");
  });

  test("procura um botão que não existe e estoura o timeout", async ({
    page,
  }) => {
    await page.goto("/employees");

    // Âncora real: garante que a página carregou de fato antes da falha,
    // assim o screenshot/trace mostram a tela certa.
    await expect(
      page.getByRole("heading", { name: /funcionários/i }),
    ).toBeVisible();

    // ⛔️ Falha proposital: esse botão não existe na página.
    // O Playwright vai ficar re-tentando ("auto-waiting") por 5s e então
    // falhar, anexando screenshot + vídeo + trace ao relatório.
    await expect(
      page.getByRole("button", { name: "Lançar foguete 🚀" }),
    ).toBeVisible();
  });
});
