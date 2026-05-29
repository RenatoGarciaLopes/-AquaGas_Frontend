"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/shared/api/errors";
import type { WaivePenaltyInput, CancelPenaltyInput } from "@/features/plan/types";

import {
  confirmPenaltyPayment,
  waivePenalty,
  cancelPenalty,
} from "@/features/plan/api/plan-client.api";
import { parsePlanSubActionError } from "@/features/plan/lib/plan-errors";

export function useConfirmPenaltyPayment(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (penaltyId: string) => confirmPenaltyPayment(penaltyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      toast.success("Pagamento da multa confirmado.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanSubActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useWaivePenalty(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      penaltyId,
      input,
    }: {
      penaltyId: string;
      input: WaivePenaltyInput;
    }) => waivePenalty(penaltyId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      toast.success("Multa dispensada.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanSubActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useCancelPenalty(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      penaltyId,
      input,
    }: {
      penaltyId: string;
      input: CancelPenaltyInput;
    }) => cancelPenalty(penaltyId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      toast.success("Multa cancelada.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanSubActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}
