"use client";

import { apiPost } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";

import type {
  CancelSaleInput,
  CancelSaleResponse,
  RegisterSaleInput,
  SaleResponse,
} from "@/features/sale/types";

import type { ApiResponse } from "@/shared/types/api";

function ensureData<T>(envelope: ApiResponse<T>, fallback: string): T {
  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message: envelope.error?.message ?? fallback,
      status: envelope.error?.code === "NOT_FOUND" ? 404 : 500,
    });
  }

  return envelope.data;
}

export async function cancelSale(
  id: string,
  input: CancelSaleInput,
): Promise<CancelSaleResponse> {
  const envelope = await apiPost<
    ApiResponse<CancelSaleResponse>,
    CancelSaleInput
  >(`/api/sales/${encodeURIComponent(id)}/cancel`, input);

  return ensureData(envelope, "Não foi possível cancelar a venda.");
}

export async function registerSale(
  input: RegisterSaleInput,
): Promise<SaleResponse> {
  const envelope = await apiPost<ApiResponse<SaleResponse>, RegisterSaleInput>(
    "/api/sales/register",
    input,
  );

  return ensureData(envelope, "Não foi possível finalizar a venda.");
}
