import { z } from "zod";

export const suspendPlanSchema = z.object({
  reason: z.string().trim().min(1, "Informe o motivo da suspensão."),
});

export type SuspendPlanFormData = z.infer<typeof suspendPlanSchema>;
