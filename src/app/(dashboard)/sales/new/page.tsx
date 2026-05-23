import { redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";
import { getCurrentUserRole } from "@/shared/auth/server";

import { PdvShell } from "@/features/sale/components/pdv/pdv-shell";
import type { SaleProduct, SaleCustomer } from "@/features/sale/types";

import type { ApiResponse } from "@/shared/types/api";

async function getInitialProducts() {
  const envelope =
    await serverFetch<ApiResponse<SaleProduct[]>>("/api/products");
  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message: envelope.error?.message ?? "Falha ao carregar produtos.",
      status: 500,
    });
  }
  return envelope.data;
}

async function getInitialCustomers() {
  const envelope =
    await serverFetch<ApiResponse<SaleCustomer[]>>("/api/customers");
  if (!envelope.success || envelope.data === null) return [];
  return envelope.data;
}

export default async function NewSalePage() {
  const role = await getCurrentUserRole();
  let initialProducts: SaleProduct[];
  let initialCustomers: SaleCustomer[];

  try {
    [initialProducts, initialCustomers] = await Promise.all([
      getInitialProducts(),
      getInitialCustomers(),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    throw error;
  }

  return (
    <PdvShell
      role={role}
      initialProducts={initialProducts}
      initialCustomers={initialCustomers}
    />
  );
}
