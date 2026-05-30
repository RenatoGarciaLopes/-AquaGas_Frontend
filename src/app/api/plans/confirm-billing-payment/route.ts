import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/shared/api/backend-proxy";

export async function PATCH(request: NextRequest) {
  const body = await request.text();
  return proxyBackendRequest(request, {
    body,
    method: "PATCH",
    path: "/api/plans/confirm-billing-payment",
  });
}
