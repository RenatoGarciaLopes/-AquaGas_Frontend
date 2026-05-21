import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import {
  extractUserRole,
  ROLE_COOKIE_NAME,
  roleFromLoginHint,
} from "@/shared/auth/roles";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  extractAccessToken,
} from "@/shared/auth/session";

type LoginRequestBody = {
  userName?: string;
  password?: string;
};

function getSetCookieHeaders(headers: Headers) {
  const headersWithSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  const setCookieHeaders = headersWithSetCookie.getSetCookie?.();

  if (setCookieHeaders?.length) {
    return setCookieHeaders;
  }

  const setCookie = headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}

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
  const setCookieHeaders = getSetCookieHeaders(backendResponse.headers);

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

  for (const setCookie of setCookieHeaders) {
    response.headers.append("set-cookie", setCookie);
  }

  if (backendResponse.ok) {
    const accessToken = extractAccessToken(payload);

    if (accessToken) {
      response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
    }

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
    response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
    response.cookies.delete(ROLE_COOKIE_NAME);
  }

  return response;
}
