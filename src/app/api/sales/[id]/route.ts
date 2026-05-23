import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/shared/api/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackendRequest(request, {
    method: "GET",
    path: `/api/sales/${encodeURIComponent(id)}`,
  });
}
