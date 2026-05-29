import { z } from "zod";

const planItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto."),
  quantity: z.number().int().min(1, "Quantidade mínima é 1."),
});

export const createPlanSchema = z
  .object({
    customerId: z.string().min(1, "Selecione um cliente."),
    cycle: z.enum(["Monthly", "Quarterly", "Annual", "Custom"], {
      required_error: "Selecione um ciclo.",
    }),
    deliveryDay: z
      .number({ required_error: "Informe o dia da entrega." })
      .int()
      .min(1, "Dia deve ser entre 1 e 31.")
      .max(31, "Dia deve ser entre 1 e 31."),
    billingDay: z
      .number({ required_error: "Informe o dia de vencimento." })
      .int()
      .min(1, "Dia deve ser entre 1 e 31.")
      .max(31, "Dia deve ser entre 1 e 31."),
    discount: z
      .number()
      .min(0, "Desconto não pode ser negativo.")
      .max(100, "Desconto máximo é 100%.")
      .optional(),
    durationInMonths: z
      .number()
      .int()
      .min(2, "Mínimo 2 meses.")
      .max(60, "Máximo 60 meses.")
      .optional(),
    items: z
      .array(planItemSchema)
      .min(1, "Adicione pelo menos um item ao plano."),
  })
  .superRefine((data, ctx) => {
    if (data.cycle === "Custom" && !data.durationInMonths) {
      ctx.addIssue({
        code: "custom",
        path: ["durationInMonths"],
        message: "Duração é obrigatória para ciclo personalizado.",
      });
    }
  });

export type CreatePlanSchema = z.infer<typeof createPlanSchema>;
