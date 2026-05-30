import { z } from "zod";

export const cancelSaleSchema = z.object({
  reason: z
    .string()
    .min(2, "O motivo deve ter pelo menos 2 caracteres.")
    .max(500, "O motivo deve ter no máximo 500 caracteres."),
});

export type CancelSaleFormData = z.infer<typeof cancelSaleSchema>;
