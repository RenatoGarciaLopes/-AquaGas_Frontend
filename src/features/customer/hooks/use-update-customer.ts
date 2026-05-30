"use client";

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateCustomerInput } from "@/features/customer/types";
import { updateCustomer } from "@/features/customer/api/customer-client.api";

export function useUpdateCustomer(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCustomerInput) =>
      updateCustomer(customerId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      void queryClient.invalidateQueries({
        queryKey: ["customers", "detail", customerId],
      });
      toast.success("Cliente atualizado com sucesso.");
    },
  });
}
