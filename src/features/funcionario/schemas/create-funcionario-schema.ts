import { z } from "zod";

import { onlyDigits } from "@/shared/lib/formatters";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (factor: number) => {
    const total = cpf
      .slice(0, factor - 1)
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * (factor - index), 0);
    const result = (total * 10) % 11;

    return result === 10 ? 0 : result;
  };

  return calculateDigit(10) === Number(cpf[9]) && calculateDigit(11) === Number(cpf[10]);
}

export const createFuncionarioSchema = z.object({
  cpf: z
    .string()
    .refine((value) => isValidCpf(value), "CPF inválido")
    .transform((value) => onlyDigits(value)),
  email: z.string().min(1, "Email inválido").email("Email inválido"),
  name: z.string().trim().min(3, "Informe o nome"),
  password: z.string().regex(PASSWORD_PATTERN, "Senha inválida"),
  phone: z
    .string()
    .refine((value) => {
      const digits = onlyDigits(value);

      return digits.length === 10 || digits.length === 11;
    }, "Telefone inválido")
    .transform((value) => onlyDigits(value)),
  role: z.enum(["Gerente", "Funcionario"], {
    errorMap: () => ({ message: "Cargo inválido" }),
  }),
  userName: z.string().trim().min(1, "Informe o usuário").min(3, "Informe o usuário"),
});

export type CreateFuncionarioSchema = z.input<typeof createFuncionarioSchema>;
export type CreateFuncionarioPayload = z.output<typeof createFuncionarioSchema>;

export function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (score <= 2) {
    return { label: "Fraca", score };
  }

  if (score <= 4) {
    return { label: "Média", score };
  }

  return { label: "Forte", score };
}
