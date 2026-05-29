import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test.describe("auth", () => {
  test("login renderiza os campos principais", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("#userName")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Entrar$/ })).toBeVisible();
  });

  test("login expirada mostra aviso e não tem violações a11y críticas", async ({
    page,
  }) => {
    await page.goto("/login?expired=1");

    await expect(page.getByText(/sua sessão expirou/i)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const seriousOrCriticalViolations = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );
    expect(seriousOrCriticalViolations).toEqual([]);
  });
});
