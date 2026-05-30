import { expect, type Page } from "@playwright/test";

function base64Url(input: unknown) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

function jwtForRole(userName: "funcionario" | "gerente") {
  const now = Math.floor(Date.now() / 1000);
  const role = userName === "gerente" ? "Manager" : "Employee";
  return [
    base64Url({ alg: "none", typ: "JWT" }),
    base64Url({ exp: now + 3600, role, unique_name: userName, userName }),
    "signature",
  ].join(".");
}

export async function loginAs(
  page: Page,
  userName: "funcionario" | "gerente" = "gerente",
) {
  const role = userName === "gerente" ? "GERENTE" : "FUNCIONARIO";
  await page.context().addCookies([
    {
      httpOnly: true,
      name: "aquagas_access_token",
      sameSite: "Lax",
      url: "http://127.0.0.1:3100",
      value: jwtForRole(userName),
    },
    {
      httpOnly: true,
      name: "aquagas_refresh_token",
      sameSite: "Lax",
      url: "http://127.0.0.1:3100",
      value: `mock-refresh-${role}`,
    },
    {
      httpOnly: true,
      name: "aquagas_user_role",
      sameSite: "Lax",
      url: "http://127.0.0.1:3100",
      value: role,
    },
    {
      httpOnly: true,
      name: "aquagas_user_name",
      sameSite: "Lax",
      url: "http://127.0.0.1:3100",
      value: userName,
    },
  ]);
  await page.goto("/employees");
  await expect(page).toHaveURL(/\/employees/);
}

export async function expectNoSeriousA11yViolations(
  violations: Array<{ impact: string | null }>,
) {
  expect(
    violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
}
