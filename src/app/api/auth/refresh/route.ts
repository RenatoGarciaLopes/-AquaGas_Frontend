import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import { readRefreshCookie } from "@/shared/auth/backend-cookies";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/shared/auth/cookies";

type RefreshPayload = {
  data?: { accessToken?: string; accessExpiresAt?: number } | null;
  error?: { code?: string; message?: string } | null;
  success?: boolean;
};

/**
 * Renova o accessToken usando o refreshToken httpOnly.
 *
 * Não retorna o accessToken para o browser — apenas atualiza os cookies
 * httpOnly. O client (interceptor axios) só precisa saber se deu certo.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Sessão expirada." }, { status: 401 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `refreshToken=${refreshToken}`,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível alcançar o servidor de autenticação." },
      { status: 503 },
    );
  }

  const text = await backendResponse.text();
  let payload: RefreshPayload | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as RefreshPayload;
    } catch {
      payload = null;
    }
  }

  if (!backendResponse.ok) {
    const response = NextResponse.json(payload ?? { message: text }, {
      status: backendResponse.status,
    });
    if (backendResponse.status === 401) {
      response.cookies.delete(ACCESS_COOKIE_NAME);
      response.cookies.delete(REFRESH_COOKIE_NAME);
    }
    return response;
  }

  const accessToken = payload?.data?.accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { message: "Resposta de refresh inválida." },
      { status: 502 },
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true });

  const accessExpires = payload?.data?.accessExpiresAt
    ? new Date(payload.data.accessExpiresAt * 1000)
    : undefined;

  response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    expires: accessExpires,
  });

  // Se o backend rotacionou o refresh token, persistir o novo.
  const rotatedRefresh = readRefreshCookie(backendResponse);
  if (rotatedRefresh) {
    response.cookies.set(REFRESH_COOKIE_NAME, rotatedRefresh.value, {
      httpOnly: true,
      path: "/",
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
      expires: rotatedRefresh.expires,
    });
  }

  return response;
}
