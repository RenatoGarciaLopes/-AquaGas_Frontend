"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RegisterCustomerInput } from "@/features/customer/types";
import { createCustomer } from "@/features/customer/api/customer-client.api";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterCustomerInput) => createCustomer(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente cadastrado com sucesso.");
    },
  });
}
