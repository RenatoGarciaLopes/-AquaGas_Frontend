import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";
import {
  ACCESS_TOKEN_COOKIE_CANDIDATES,
  applyBearerToken,
  getCookieValue,
} from "@/shared/auth/session";

function parsePayload(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const body = await request.text();
  const headers = new Headers({
    "content-type": request.headers.get("content-type") ?? "application/json",
  });

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  applyBearerToken(
    headers,
    getCookieValue(cookieStore, ACCESS_TOKEN_COOKIE_CANDIDATES),
  );

  const backendResponse = await fetch(`${getApiBaseUrl()}/api/v1/funcionario`, {
    body,
    cache: "no-store",
    headers,
    method: "POST",
  });
  const payload = parsePayload(await backendResponse.text());

  return NextResponse.json(payload, {
    status: backendResponse.status,
  });
}
