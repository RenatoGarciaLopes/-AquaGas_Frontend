import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("aquagas_access_token")?.value;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const body = await request.text();

  const backendRes = await fetch(`${getApiBaseUrl()}/api/employees/register`, {
    body,
    cache: "no-store",
    headers,
    method: "POST",
  });

  const text = await backendRes.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;
  return NextResponse.json(payload, { status: backendRes.status });
}
