import { z } from "zod";

export const registerSaleSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  discount: z.number().min(0).max(100).nullable().optional(),
  saleItems: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Adicione pelo menos um item."),
});

export type RegisterSaleSchema = z.infer<typeof registerSaleSchema>;
