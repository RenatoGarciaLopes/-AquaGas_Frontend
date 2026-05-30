import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const dateRangeSchema = z
  .object({
    start: z.string().regex(ISO_DATE, "Data inicial inválida"),
    end: z.string().regex(ISO_DATE, "Data final inválida"),
  })
  .refine((v) => v.start <= v.end, {
    message: "A data inicial deve ser anterior ou igual à final",
    path: ["end"],
  });

export type DateRangeFilter = z.infer<typeof dateRangeSchema>;

export const salesFiltersSchema = dateRangeSchema.and(
  z.object({
    status: z.enum(["FINISHED", "CANCELLED"]).optional(),
    type: z.enum(["SALE", "PLAN"]).optional(),
  }),
);
export type SalesFilters = z.infer<typeof salesFiltersSchema>;

export const stockFiltersSchema = dateRangeSchema.and(
  z.object({
    productId: z.string().optional(),
    type: z.enum(["Entry", "Exit"]).optional(),
  }),
);
export type StockFilters = z.infer<typeof stockFiltersSchema>;

export const penaltyFiltersSchema = dateRangeSchema.and(
  z.object({
    status: z
      .enum(["PENDING_PAYMENT", "PAID", "WAIVED", "CANCELED", "OVERDUE"])
      .optional(),
    type: z.enum(["DOWNGRADE", "EARLY_CANCELLATION"]).optional(),
  }),
);
export type PenaltyFilters = z.infer<typeof penaltyFiltersSchema>;
