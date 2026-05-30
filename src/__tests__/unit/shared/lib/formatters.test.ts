import { it, expect, describe } from "vitest";

import { onlyDigits } from "@/shared/lib/formatters";

describe("onlyDigits", () => {
  it("preserva sequência de dígitos", () => {
    expect(onlyDigits("12345")).toBe("12345");
  });

  it("remove qualquer caractere não numérico preservando ordem", () => {
    expect(onlyDigits("(11) 99999-8888")).toBe("11999998888");
    expect(onlyDigits("529.982.247-25")).toBe("52998224725");
    expect(onlyDigits("abc123def456")).toBe("123456");
  });

  it("retorna string vazia para null/undefined/vazio", () => {
    expect(onlyDigits(null)).toBe("");
    expect(onlyDigits(undefined)).toBe("");
    expect(onlyDigits("")).toBe("");
  });
});
