import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const backendResponse = await fetch(
    `${getApiBaseUrl()}/api/v1/funcionario/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      method: "DELETE",
    },
  );
  const payload = parsePayload(await backendResponse.text());

  return NextResponse.json(payload, {
    status: backendResponse.status,
  });
}
