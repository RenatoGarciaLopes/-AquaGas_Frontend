import { describe, expect, it } from "vitest";

import { loginSchema } from "@/features/auth/schemas/login-schema";

describe("loginSchema", () => {
  it("aceita credenciais preenchidas", () => {
    expect(
      loginSchema.safeParse({ password: "secret", userName: "gerente" })
        .success,
    ).toBe(true);
  });

  it("rejeita campos obrigatórios vazios", () => {
    const result = loginSchema.safeParse({ password: "", userName: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.userName?.[0]).toMatch(
        /nome de usuário/i,
      );
      expect(result.error.flatten().fieldErrors.password?.[0]).toMatch(
        /senha/i,
      );
    }
  });
});
