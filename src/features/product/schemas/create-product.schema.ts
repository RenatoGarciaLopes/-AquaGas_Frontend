import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nome deve ter ao menos 3 caracteres.")
    .max(150, "Nome deve ter no máximo 150 caracteres."),
  type: z.enum(["Water", "Gas"], {
    message: "Selecione o tipo do produto.",
  }),
  price: z
    .number({ message: "Informe um preço válido." })
    .positive("Preço deve ser maior que zero."),
  quantity: z.coerce
    .number({ message: "Informe a quantidade." })
    .int("Quantidade deve ser um número inteiro.")
    .min(0, "Quantidade não pode ser negativa."),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
