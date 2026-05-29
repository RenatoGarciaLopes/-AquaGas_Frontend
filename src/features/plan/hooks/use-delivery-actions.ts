"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/shared/api/errors";
import type {
  ConfirmDeliveryInput,
  CancelDeliveryInput,
  RescheduleDeliveryInput,
} from "@/features/plan/types";

import {
  confirmDelivery,
  cancelDelivery,
  rescheduleDelivery,
} from "@/features/plan/api/plan-client.api";
import { parsePlanSubActionError } from "@/features/plan/lib/plan-errors";

export function useConfirmDelivery(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmDeliveryInput) => confirmDelivery(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      toast.success("Entrega confirmada.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanSubActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useCancelDelivery(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CancelDeliveryInput) => cancelDelivery(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      toast.success("Entrega cancelada.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanSubActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useRescheduleDelivery(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RescheduleDeliveryInput) => rescheduleDelivery(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      toast.success("Entrega reagendada.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanSubActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}
