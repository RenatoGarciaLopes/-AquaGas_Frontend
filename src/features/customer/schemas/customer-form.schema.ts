import { z } from "zod";

import {
  isValidCep,
  isValidCpf,
  isValidCnpj,
  isValidPhone,
} from "@/shared/lib/validators";

export const customerAddressSchema = z.object({
  cep: z
    .string()
    .trim()
    .min(1, "CEP é obrigatório.")
    .refine(isValidCep, "CEP deve ter 8 dígitos."),
  city: z.string().trim().min(2, "Cidade deve ter ao menos 2 caracteres."),
  complement: z
    .string()
    .trim()
    .max(100, "Complemento deve ter no máximo 100 caracteres.")
    .optional(),
  neighborhood: z
    .string()
    .trim()
    .min(2, "Bairro deve ter ao menos 2 caracteres."),
  number: z
    .string()
    .trim()
    .min(1, "Número é obrigatório.")
    .max(10, "Número deve ter no máximo 10 caracteres."),
  street: z.string().trim().min(3, "Rua deve ter ao menos 3 caracteres."),
});

export const customerContactSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório.")
    .email("Informe um email válido."),
  phone: z
    .string()
    .trim()
    .min(1, "Telefone é obrigatório.")
    .refine(isValidPhone, "Telefone deve ter 10 ou 11 dígitos."),
});

export const customerIdentitySchema = z
  .object({
    document: z.string().trim().min(1, "Documento é obrigatório."),
    name: z
      .string()
      .trim()
      .min(3, "Nome deve ter ao menos 3 caracteres.")
      .max(150, "Nome deve ter no máximo 150 caracteres."),
    type: z.enum(["PF", "PJ"], {
      message: "Selecione o tipo de cliente.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PF" && !isValidCpf(data.document)) {
      ctx.addIssue({
        code: "custom",
        message: "CPF inválido.",
        path: ["document"],
      });
    }

    if (data.type === "PJ" && !isValidCnpj(data.document)) {
      ctx.addIssue({
        code: "custom",
        message: "CNPJ inválido.",
        path: ["document"],
      });
    }
  });
