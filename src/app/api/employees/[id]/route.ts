import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("aquagas_access_token")?.value;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const backendRes = await fetch(
    `${getApiBaseUrl()}/api/employees/${encodeURIComponent(id)}`,
    { cache: "no-store", headers, method: "DELETE" },
  );

  // 204 No Content — retornar sem corpo
  if (backendRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await backendRes.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;
  return NextResponse.json(payload, { status: backendRes.status });
}
