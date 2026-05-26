import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/shared/api/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();

  return proxyBackendRequest(request, {
    method: "POST",
    path: `/api/sales/${encodeURIComponent(id)}/cancel`,
    body,
  });
}
