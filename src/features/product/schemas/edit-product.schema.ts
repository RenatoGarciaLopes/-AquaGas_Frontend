import { z } from "zod";

export const editProductDetailsSchema = z.object({
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
});

export type EditProductDetailsSchema = z.infer<typeof editProductDetailsSchema>;

export const adjustStockSchema = z.object({
  stockMovementType: z.enum(["Entry", "Exit"], {
    message: "Selecione o tipo de movimentação.",
  }),
  quantity: z.coerce
    .number({ message: "Informe a quantidade." })
    .int("Quantidade deve ser um número inteiro.")
    .positive("Quantidade deve ser maior que zero."),
  reason: z
    .string()
    .trim()
    .min(3, "Motivo deve ter ao menos 3 caracteres.")
    .max(200, "Motivo deve ter no máximo 200 caracteres."),
});

export type AdjustStockSchema = z.infer<typeof adjustStockSchema>;
