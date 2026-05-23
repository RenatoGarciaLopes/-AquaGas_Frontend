import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";

import type { SaleResponse } from "@/features/sale/types";

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

export async function getSaleById(id: string): Promise<SaleResponse> {
  const envelope = await serverFetch<ApiResponse<SaleResponse>>(
    `/api/sales/${encodeURIComponent(id)}`,
  );

  return ensureData(envelope, "Venda não encontrada.");
}

export async function listSales(): Promise<SaleResponse[]> {
  const envelope = await serverFetch<ApiResponse<SaleResponse[]>>("/api/sales");

  return ensureData(envelope, "Falha ao carregar vendas.");
}
