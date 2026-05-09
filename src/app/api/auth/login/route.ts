import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

type LoginRequestBody = {
  userName?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ message: "Payload inválido." }, { status: 400 });
  }

  if (!body.userName || !body.password) {
    return NextResponse.json(
      { message: "Usuário e senha são obrigatórios." },
      { status: 400 },
    );
  }

  const backendResponse = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      userName: body.userName,
      password: body.password,
    }),
    cache: "no-store",
  });

  const responseText = await backendResponse.text();
  const setCookie = backendResponse.headers.get("set-cookie");

  let payload: unknown = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { message: responseText };
    }
  }

  return NextResponse.json(payload, {
    status: backendResponse.status,
    headers: setCookie ? { "set-cookie": setCookie } : undefined,
  });
}
