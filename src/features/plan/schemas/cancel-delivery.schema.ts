import { z } from "zod";

export const cancelDeliverySchema = z.object({
  reason: z.string().trim().min(1, "Informe o motivo do cancelamento."),
});

export type CancelDeliveryFormData = z.infer<typeof cancelDeliverySchema>;
