import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/shared/api/backend-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return proxyBackendRequest(_request, {
    method: "DELETE",
    path: `/api/employees/${encodeURIComponent(id)}`,
  });
}
