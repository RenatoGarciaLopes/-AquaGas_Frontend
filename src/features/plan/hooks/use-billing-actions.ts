"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/shared/api/errors";
import type { ConfirmBillingPaymentInput } from "@/features/plan/types";
import { confirmBillingPayment } from "@/features/plan/api/plan-client.api";
import { parsePlanSubActionError } from "@/features/plan/lib/plan-errors";

export function useConfirmBillingPayment(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmBillingPaymentInput) =>
      confirmBillingPayment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      toast.success("Pagamento confirmado.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanSubActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}
