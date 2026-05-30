import { z } from "zod";

import { digitsOnly } from "@/shared/lib/masks";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function isValidCpf(value: string): boolean {
  const cpf = digitsOnly(value);
  if (!/^\d{11}$/.test(cpf)) return false;
  if (new Set(cpf).size === 1) return false;

  const calculateDigit = (size: number) => {
    let sum = 0;
    let multiplier = size + 1;

    for (let i = 0; i < size; i += 1) {
      sum += Number(cpf[i]) * multiplier;
      multiplier -= 1;
    }

    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10])
  );
}

export const createEmployeeSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, "Informe o usuário")
    .min(3, "Informe ao menos 3 caracteres")
    .max(50, "Usuário deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "Use apenas letras e números"),
  password: z.string().regex(PASSWORD_REGEX, "Senha inválida"),
  role: z.enum(["Manager", "Employee"], {
    message: "Cargo inválido",
  }),
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome")
    .min(3, "Nome deve ter ao menos 3 caracteres"),
  cpf: z.string().transform(digitsOnly).refine(isValidCpf, "CPF inválido"),
  phone: z
    .string()
    .transform(digitsOnly)
    .refine(
      (value) => value.length === 10 || value.length === 11,
      "Telefone inválido",
    ),
  email: z.string().trim().min(1, "Informe o email").email("Email inválido"),
});

export type CreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;
