import { z } from "zod";

export const cancelPlanSchema = z.object({
  reason: z.string().trim().optional(),
});

export type CancelPlanFormData = z.infer<typeof cancelPlanSchema>;
