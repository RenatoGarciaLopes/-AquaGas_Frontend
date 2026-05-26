import { z } from "zod";

import { digitsOnly } from "@/shared/lib/masks";

import {
  isValidCpf,
  PASSWORD_REGEX,
} from "@/features/employee/schemas/create-employee.schema";

export const editEmployeeSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, "Informe o usuário")
    .min(3, "Informe ao menos 3 caracteres")
    .max(50, "Usuário deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "Use apenas letras e números"),
  password: z
    .string()
    .refine((value) => value === "" || PASSWORD_REGEX.test(value), {
      message: "Senha inválida",
    }),
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
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      {
        message: "Email inválido",
      },
    ),
});

export type EditEmployeeSchema = z.infer<typeof editEmployeeSchema>;
