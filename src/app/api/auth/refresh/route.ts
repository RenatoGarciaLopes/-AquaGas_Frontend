import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_COOKIE_NAME } from "@/shared/auth/cookies";
import { refreshSessionOnce } from "@/shared/auth/server-refresh";
import {
  clearAuthCookies,
  setAuthCookies,
} from "@/shared/auth/session-cookies";

/**
 * Renova o accessToken usando o refreshToken httpOnly.
 *
 * Não retorna o accessToken para o browser — apenas atualiza os cookies
 * httpOnly. O client (interceptor axios) só precisa saber se deu certo.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!refreshToken) {
    const response = NextResponse.json(
      { message: "Sessão expirada." },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const refreshed = await refreshSessionOnce(refreshToken);
  if (!refreshed.ok) {
    const response = NextResponse.json(refreshed.payload, {
      status: refreshed.status,
    });
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ success: true });
  setAuthCookies(response, {
    accessExpiresAt: refreshed.accessExpiresAt,
    accessToken: refreshed.accessToken,
    refreshExpiresAt: refreshed.refreshExpiresAt,
    refreshToken: refreshed.refreshToken,
  });
  return response;
}
