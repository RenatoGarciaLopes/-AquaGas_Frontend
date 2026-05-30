import { ApiError } from "@/shared/api/errors";
import { serverFetch } from "@/shared/api/server-fetch";

import type {
  SalesReport,
  PenaltyReport,
  ReportRangeQuery,
  PenaltyRangeQuery,
  StockMovementReport,
} from "@/features/report/types";

import type { ApiResponse } from "@/shared/types/api";

function unwrap<T>(envelope: ApiResponse<T>, fallback: string): T {
  if (!envelope.success || envelope.data === null) {
    throw new ApiError({
      code: envelope.error?.code,
      message: envelope.error?.message ?? fallback,
      status: 500,
    });
  }
  return envelope.data;
}

// O backend normaliza Start/End para UTC e usa-os direto na query do repositório.
// Se mandarmos só `yyyy-MM-dd`, o ASP.NET interpreta como 00:00:00 do dia — o
// que faz a janela perder qualquer registro do dia final. Para evitar isso,
// mandamos sempre o intervalo completo: 00:00:00 no `start` e 23:59:59.999 no
// `end`, em UTC.
function toStartIso(date: string | undefined): string | undefined {
  return date ? `${date}T00:00:00.000Z` : undefined;
}

function toEndIso(date: string | undefined): string | undefined {
  return date ? `${date}T23:59:59.999Z` : undefined;
}

export async function getSalesReport(
  query: ReportRangeQuery,
): Promise<SalesReport> {
  const envelope = await serverFetch<ApiResponse<SalesReport>>(
    "/api/reports/sales",
    {
      params: {
        start: toStartIso(query.start),
        end: toEndIso(query.end),
      },
    },
  );
  return unwrap(envelope, "Falha ao carregar relatório de vendas.");
}

export async function getStockMovementReport(
  query: ReportRangeQuery,
): Promise<StockMovementReport> {
  const envelope = await serverFetch<ApiResponse<StockMovementReport>>(
    "/api/reports/stock-movements",
    {
      params: {
        start: toStartIso(query.start),
        end: toEndIso(query.end),
      },
    },
  );
  return unwrap(envelope, "Falha ao carregar relatório de estoque.");
}

export async function getPenaltyReport(
  query: PenaltyRangeQuery = {},
): Promise<PenaltyReport> {
  const envelope = await serverFetch<ApiResponse<PenaltyReport>>(
    "/api/reports/contract-penalties",
    {
      params: {
        start: toStartIso(query.start),
        end: toEndIso(query.end),
      },
    },
  );
  return unwrap(envelope, "Falha ao carregar relatório de multas.");
}
