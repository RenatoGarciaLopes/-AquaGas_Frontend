import { z } from "zod";

export const upgradePlanSchema = z
  .object({
    cycle: z
      .enum(["Monthly", "Quarterly", "Annual", "Custom"])
      .optional(),
    durationInMonths: z.number().int().min(2).max(60).optional(),
    reason: z.string().max(500).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.cycle === "Custom" && !data.durationInMonths) {
      ctx.addIssue({
        code: "custom",
        path: ["durationInMonths"],
        message: "Duração é obrigatória para ciclo personalizado.",
      });
    }
    if (!data.cycle && (!data.items || data.items.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["cycle"],
        message: "Informe ao menos uma alteração (ciclo ou itens).",
      });
    }
  });

export type UpgradePlanFormData = z.infer<typeof upgradePlanSchema>;
