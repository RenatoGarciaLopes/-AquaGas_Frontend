import { z } from "zod";

export const rescheduleDeliverySchema = z.object({
  newDate: z.string().min(1, "Informe a nova data."),
  reason: z
    .string()
    .trim()
    .min(5, "Motivo deve ter no mínimo 5 caracteres.")
    .max(500, "Motivo deve ter no máximo 500 caracteres."),
});

export type RescheduleDeliveryFormData = z.infer<
  typeof rescheduleDeliverySchema
>;
