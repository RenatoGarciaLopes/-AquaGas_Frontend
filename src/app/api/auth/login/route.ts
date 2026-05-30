import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import { readRefreshCookie } from "@/shared/auth/backend-cookies";
import {
  type UserRole,
  extractUserRole,
  decodeJwtPayload,
} from "@/shared/auth/roles";
import {
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/shared/auth/cookies";

type LoginRequestBody = {
  userName?: string;
  password?: string;
};

type LoginPayload = {
  data?: {
    accessToken?: string;
    expiresAt?: number;
    user?: { role?: string; userName?: string };
  } | null;
};

function resolveRole(
  payload: LoginPayload,
  accessToken: string,
): UserRole | null {
  return (
    extractUserRole(payload) ?? extractUserRole(decodeJwtPayload(accessToken))
  );
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
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      userName: body.userName,
      password: body.password,
    }),
    cache: "no-store",
  });

  const text = await backendResponse.text();
  let payload: LoginPayload | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as LoginPayload;
    } catch {
      payload = null;
    }
  }

  if (!backendResponse.ok) {
    const response = NextResponse.json(payload ?? { message: text }, {
      status: backendResponse.status,
    });
    response.cookies.delete(ACCESS_COOKIE_NAME);
    response.cookies.delete(REFRESH_COOKIE_NAME);
    response.cookies.delete(ROLE_COOKIE_NAME);
    response.cookies.delete(USER_NAME_COOKIE);
    return response;
  }

  const accessToken = payload?.data?.accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { message: "Resposta de autenticação inválida (sem accessToken)." },
      { status: 502 },
    );
  }

  const role = resolveRole(payload ?? {}, accessToken);
  if (!role) {
    return NextResponse.json(
      { message: "Resposta de autenticação inválida (sem role)." },
      { status: 502 },
    );
  }

  const refresh = readRefreshCookie(backendResponse);
  if (!refresh) {
    return NextResponse.json(
      { message: "Resposta de autenticação inválida (sem refresh token)." },
      { status: 502 },
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json(payload, { status: 200 });

  // expiresAt vem como Unix em segundos; multiplicar por 1000 para Date(ms).
  const accessExpires = payload?.data?.expiresAt
    ? new Date(payload.data.expiresAt * 1000)
    : undefined;

  response.cookies.set(REFRESH_COOKIE_NAME, refresh.value, {
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    expires: refresh.expires,
  });

  response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    expires: accessExpires,
  });

  response.cookies.set(ROLE_COOKIE_NAME, role, {
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
  });

  response.cookies.set(USER_NAME_COOKIE, body.userName, {
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
  });

  return response;
}
