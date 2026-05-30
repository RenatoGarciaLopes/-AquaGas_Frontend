"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RegisterPlanInput } from "@/features/plan/types";
import { createPlan } from "@/features/plan/api/plan-client.api";

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterPlanInput) => createPlan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano criado com sucesso.");
    },
  });
}
