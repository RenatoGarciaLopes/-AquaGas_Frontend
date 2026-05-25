import { it, expect, describe } from "vitest";

import {
  isValidCep,
  isValidCpf,
  isValidCnpj,
  isValidPhone,
} from "@/shared/lib/validators";

describe("isValidCpf", () => {
  it("aceita CPF válido sem máscara", () => {
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("aceita CPF válido com máscara", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("rejeita 11 dígitos repetidos (DVs casam mas é inválido)", () => {
    expect(isValidCpf("11111111111")).toBe(false);
    expect(isValidCpf("00000000000")).toBe(false);
  });

  it("rejeita comprimento errado", () => {
    expect(isValidCpf("123")).toBe(false);
    expect(isValidCpf("123456789012")).toBe(false);
  });

  it("rejeita dígitos verificadores incorretos", () => {
    expect(isValidCpf("52998224726")).toBe(false);
  });

  it("rejeita null/undefined/string vazia", () => {
    expect(isValidCpf(null)).toBe(false);
    expect(isValidCpf(undefined)).toBe(false);
    expect(isValidCpf("")).toBe(false);
  });
});

describe("isValidCnpj", () => {
  it("aceita CNPJ válido sem máscara", () => {
    expect(isValidCnpj("11444777000161")).toBe(true);
  });

  it("aceita CNPJ válido com máscara", () => {
    expect(isValidCnpj("11.444.777/0001-61")).toBe(true);
  });

  it("rejeita 14 dígitos repetidos", () => {
    expect(isValidCnpj("11111111111111")).toBe(false);
  });

  it("rejeita comprimento errado", () => {
    expect(isValidCnpj("123")).toBe(false);
    expect(isValidCnpj("123456789012345")).toBe(false);
  });

  it("rejeita dígitos verificadores incorretos", () => {
    expect(isValidCnpj("11444777000162")).toBe(false);
  });

  it("rejeita null/undefined/string vazia", () => {
    expect(isValidCnpj(null)).toBe(false);
    expect(isValidCnpj(undefined)).toBe(false);
    expect(isValidCnpj("")).toBe(false);
  });
});

describe("isValidCep", () => {
  it("aceita 8 dígitos sem máscara", () => {
    expect(isValidCep("12345678")).toBe(true);
  });

  it("aceita formato 5+3 com hífen", () => {
    expect(isValidCep("12345-678")).toBe(true);
  });

  it("rejeita comprimento errado", () => {
    expect(isValidCep("1234567")).toBe(false);
    expect(isValidCep("123456789")).toBe(false);
  });

  it("rejeita strings com letras", () => {
    expect(isValidCep("12345abc")).toBe(false);
  });

  it("rejeita null/undefined/string vazia", () => {
    expect(isValidCep(null)).toBe(false);
    expect(isValidCep(undefined)).toBe(false);
    expect(isValidCep("")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("aceita 10 dígitos (fixo)", () => {
    expect(isValidPhone("1133334444")).toBe(true);
  });

  it("aceita 11 dígitos (celular)", () => {
    expect(isValidPhone("11999998888")).toBe(true);
  });

  it("aceita telefone com máscara", () => {
    expect(isValidPhone("(11) 99999-8888")).toBe(true);
    expect(isValidPhone("(11) 3333-4444")).toBe(true);
  });

  it("rejeita 9 e 12 dígitos", () => {
    expect(isValidPhone("123456789")).toBe(false);
    expect(isValidPhone("123456789012")).toBe(false);
  });

  it("rejeita null/undefined/string vazia", () => {
    expect(isValidPhone(null)).toBe(false);
    expect(isValidPhone(undefined)).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});
