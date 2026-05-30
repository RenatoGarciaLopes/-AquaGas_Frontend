import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/shared/api/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackendRequest(request, {
    method: "PATCH",
    path: `/api/plans/${encodeURIComponent(id)}/reactivate`,
  });
}
