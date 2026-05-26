import { describe, expect, it } from "vitest";

import {
  decodeJwtPayload,
  extractUserRole,
  isGerente,
  roleToLabel,
} from "@/shared/auth/roles";

function makeJwt(payload: Record<string, unknown>) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${encoded}.signature`;
}

describe("auth roles", () => {
  it("normaliza roles do backend e do frontend", () => {
    expect(extractUserRole({ role: "Manager" })).toBe("GERENTE");
    expect(extractUserRole({ role: "Employee" })).toBe("FUNCIONARIO");
    expect(extractUserRole({ role: "GERENTE" })).toBe("GERENTE");
    expect(extractUserRole({ role: "FUNCIONARIO" })).toBe("FUNCIONARIO");
  });

  it("extrai role de claims .NET, arrays e payloads aninhados", () => {
    expect(
      extractUserRole({
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
          "Manager",
      }),
    ).toBe("GERENTE");
    expect(extractUserRole({ roles: ["ROLE_Employee"] })).toBe("FUNCIONARIO");
    expect(extractUserRole({ data: { user: { role: "Manager" } } })).toBe(
      "GERENTE",
    );
  });

  it("extrai role de accessToken quando presente", () => {
    const token = makeJwt({ role: "Employee" });
    expect(extractUserRole({ accessToken: token })).toBe("FUNCIONARIO");
  });

  it("decodifica JWT válido e rejeita tokens inválidos", () => {
    const payload = decodeJwtPayload(makeJwt({ userName: "ana" }));
    expect(payload).toMatchObject({ userName: "ana" });
    expect(decodeJwtPayload("invalid")).toBeNull();
    expect(decodeJwtPayload("a.not-json.c")).toBeNull();
  });

  it("expõe helpers de permissão e label", () => {
    expect(isGerente("GERENTE")).toBe(true);
    expect(isGerente("FUNCIONARIO")).toBe(false);
    expect(roleToLabel("GERENTE")).toBe("Gerente");
    expect(roleToLabel("FUNCIONARIO")).toBe("Funcionário");
    expect(roleToLabel(null)).toBe("—");
  });
});
