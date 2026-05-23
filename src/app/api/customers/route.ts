import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/shared/api/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, {
    method: "GET",
    path: "/api/customers",
  });
}
