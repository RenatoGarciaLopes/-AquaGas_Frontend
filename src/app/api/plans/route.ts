import { type NextRequest } from "next/server";

import { proxyBackendRequest } from "@/shared/api/backend-proxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, {
    method: "GET",
    path: "/api/plans",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyBackendRequest(request, {
    body,
    method: "POST",
    path: "/api/plans/register",
  });
}
