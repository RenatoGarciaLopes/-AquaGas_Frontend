import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import {
  extractUserRole,
  ROLE_COOKIE_NAME,
  roleFromLoginHint,
} from "@/shared/auth/roles";

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

  const response = NextResponse.json(payload, {
    status: backendResponse.status,
  });

  if (setCookie) {
    response.headers.append("set-cookie", setCookie);
  }

  if (backendResponse.ok) {
    response.cookies.set(
      ROLE_COOKIE_NAME,
      extractUserRole(payload) ?? roleFromLoginHint(body.userName),
      {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      },
    );
  } else {
    response.cookies.delete(ROLE_COOKIE_NAME);
  }

  return response;
}
