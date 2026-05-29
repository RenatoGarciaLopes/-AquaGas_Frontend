"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/shared/api/errors";
import type {
  SuspendPlanInput,
  CancelPlanInput,
  UpgradePlanInput,
  DowngradePlanInput,
} from "@/features/plan/types";

import {
  suspendPlan,
  reactivatePlan,
  cancelPlan,
  upgradePlan,
  downgradePlan,
} from "@/features/plan/api/plan-client.api";
import { parsePlanActionError } from "@/features/plan/lib/plan-errors";

export function useSuspendPlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SuspendPlanInput) => suspendPlan(planId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano suspenso com sucesso.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useReactivatePlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reactivatePlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano reativado com sucesso.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useCancelPlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CancelPlanInput) => cancelPlan(planId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano cancelado.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useUpgradePlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpgradePlanInput) => upgradePlan(planId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Upgrade aplicado com sucesso.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}

export function useDowngradePlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DowngradePlanInput) => downgradePlan(planId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans", planId] });
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Downgrade aplicado.");
    },
    onError: (error: unknown) => {
      const { message } = parsePlanActionError(error, error instanceof ApiError ? error.status : 0);
      toast.error(message);
    },
  });
}
