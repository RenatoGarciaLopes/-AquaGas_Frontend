import { z } from "zod";

export const downgradePlanSchema = z
  .object({
    cycle: z
      .enum(["Monthly", "Quarterly", "Annual", "Custom"])
      .optional(),
    durationInMonths: z.number().int().min(2).max(60).optional(),
    reason: z
      .string()
      .trim()
      .min(5, "Motivo deve ter no mínimo 5 caracteres.")
      .max(500, "Motivo deve ter no máximo 500 caracteres."),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(0),
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

export type DowngradePlanFormData = z.infer<typeof downgradePlanSchema>;
