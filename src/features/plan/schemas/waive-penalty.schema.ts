import { z } from "zod";

export const waivePenaltySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Motivo deve ter no mínimo 10 caracteres.")
    .max(500, "Motivo deve ter no máximo 500 caracteres."),
});

export type WaivePenaltyFormData = z.infer<typeof waivePenaltySchema>;
