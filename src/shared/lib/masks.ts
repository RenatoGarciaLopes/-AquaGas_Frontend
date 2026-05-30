/**
 * Máscaras e guardas de entrada reutilizáveis.
 *
 * Concentra:
 * - BRL (moeda): mask baseado em centavos para formulários monetários.
 * - Guardas de teclado/colagem para campos numéricos (inteiro / decimal).
 *
 * Funções puras: testáveis isoladamente e reutilizáveis fora do React.
 * Novas máscaras (CPF, CNPJ, telefone, CEP) entram aqui.
 */

import type { KeyboardEvent, ClipboardEvent } from "react";

// ─── BRL ─────────────────────────────────────────────────────────────────────

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function applyPattern(digits: string, pattern: string) {
  let result = "";
  let index = 0;

  for (const char of pattern) {
    if (char === "0") {
      if (index >= digits.length) break;
      result += digits[index];
      index += 1;
    } else if (index < digits.length) {
      result += char;
    }
  }

  return result;
}

export function maskCpf(value: string) {
  return applyPattern(digitsOnly(value).slice(0, 11), "000.000.000-00");
}

export function maskCnpj(value: string) {
  return applyPattern(digitsOnly(value).slice(0, 14), "00.000.000/0000-00");
}

export function maskCustomerDocument(
  value: string,
  type: "PF" | "PJ" | undefined,
) {
  return type === "PJ" ? maskCnpj(value) : maskCpf(value);
}

export function maskPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 10) {
    return applyPattern(digits, "(00) 0000-0000");
  }
  return applyPattern(digits, "(00) 00000-0000");
}

export function maskCep(value: string) {
  return applyPattern(digitsOnly(value).slice(0, 8), "00000-000");
}

export function centsToBrl(cents: number): string {
  return BRL_FORMATTER.format(cents / 100);
}

export function numberToBrl(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return centsToBrl(Math.round(value * 100));
}

/**
 * Recebe o que o usuário digitou/colou e devolve a representação canônica:
 * - `display`: string formatada para mostrar no input (ex.: "1.234,56")
 * - `value`:   number em reais (ex.: 1234.56) ou `undefined` se vazio
 */
export function maskBrlInput(raw: string): {
  display: string;
  value: number | undefined;
} {
  const digits = digitsOnly(raw);
  if (digits === "" || digits === "0") {
    return { display: "", value: undefined };
  }
  const cents = Number(digits);
  return { display: centsToBrl(cents), value: cents / 100 };
}

// ─── Numeric input guards ────────────────────────────────────────────────────

const CONTROL_KEYS = new Set([
  "Backspace",
  "Tab",
  "Enter",
  "Escape",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

function isShortcut(event: KeyboardEvent<HTMLInputElement>) {
  return event.ctrlKey || event.metaKey || event.altKey;
}

function buildKeyGuard(allowed: RegExp) {
  return (event: KeyboardEvent<HTMLInputElement>) => {
    if (isShortcut(event)) return;
    if (CONTROL_KEYS.has(event.key)) return;
    if (!allowed.test(event.key)) {
      event.preventDefault();
    }
  };
}

function buildPasteGuard(allowed: RegExp) {
  return (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (text && !allowed.test(text)) {
      event.preventDefault();
    }
  };
}

/** Bloqueia tudo que não for dígito (inteiro positivo). */
export const onlyIntegerKeys = buildKeyGuard(/^[0-9]$/);
export const onlyIntegerPaste = buildPasteGuard(/^[0-9]+$/);

/** Bloqueia tudo que não for dígito ou separador decimal (`.` ou `,`). */
export const onlyDecimalKeys = buildKeyGuard(/^[0-9.,]$/);
export const onlyDecimalPaste = buildPasteGuard(/^[0-9]+([.,][0-9]+)?$/);
