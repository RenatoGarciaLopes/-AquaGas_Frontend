import { onlyDigits } from "@/shared/lib/formatters";

function allDigitsEqual(value: string) {
  return (
    value.length > 0 && value.split("").every((digit) => digit === value[0])
  );
}

function calculateCpfDigit(value: string, size: number) {
  let sum = 0;
  let multiplier = size + 1;

  for (let i = 0; i < size; i += 1) {
    sum += Number(value[i]) * multiplier;
    multiplier -= 1;
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(value: string | null | undefined) {
  const cpf = onlyDigits(value);
  if (!/^\d{11}$/.test(cpf) || allDigitsEqual(cpf)) return false;

  return (
    calculateCpfDigit(cpf, 9) === Number(cpf[9]) &&
    calculateCpfDigit(cpf, 10) === Number(cpf[10])
  );
}

function calculateCnpjDigit(value: string, weights: number[]) {
  const sum = weights.reduce(
    (acc, weight, index) => acc + Number(value[index]) * weight,
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string | null | undefined) {
  const cnpj = onlyDigits(value);
  if (!/^\d{14}$/.test(cnpj) || allDigitsEqual(cnpj)) return false;

  const firstDigit = calculateCnpjDigit(
    cnpj,
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const secondDigit = calculateCnpjDigit(
    cnpj,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
}

export function isValidCep(value: string | null | undefined) {
  return /^\d{8}$/.test(onlyDigits(value));
}

export function isValidPhone(value: string | null | undefined) {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11;
}
