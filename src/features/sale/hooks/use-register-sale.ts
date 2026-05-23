"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RegisterSaleInput } from "@/features/sale/types";
import { registerSale } from "@/features/sale/api/sale-client.api";

export function useRegisterSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterSaleInput) => registerSale(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
    },
  });
}
