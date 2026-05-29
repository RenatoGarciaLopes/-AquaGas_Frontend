import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { refreshSessionOnce } from "@/shared/auth/server-refresh";
import type { RefreshSessionResult } from "@/shared/auth/server-refresh";
import {
  setAuthCookies,
  clearAuthCookies,
} from "@/shared/auth/session-cookies";
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

export type SessionResponse = {
  user: {
    id: string | null;
    userName: string;
    role: UserRole;
  };
  expiresAt: number | null;
};

/**
 * Aceita uma chave em vários nomes comuns de claim JWT (.NET Identity costuma
 * usar URIs longas como
 * `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier`).
 */
function pickClaim(
  claims: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function isExpired(claims: Record<string, unknown> | null): boolean {
  const exp = claims?.exp;
  if (typeof exp !== "number") return false;
  return exp <= Math.floor(Date.now() / 1000);
}

export async function GET() {
  const cookieStore = await cookies();
  let refreshedSession: Extract<RefreshSessionResult, { ok: true }> | null =
    null;
  let accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!accessToken) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "Sem sessão." }, { status: 401 });
    }

    const refreshed = await refreshSessionOnce(refreshToken);
    if (!refreshed.ok) {
      const response = NextResponse.json(refreshed.payload, {
        status: refreshed.status,
      });
      clearAuthCookies(response);
      return response;
    }
    refreshedSession = refreshed;
    ({ accessToken } = refreshed);
  }

  let claims = decodeJwtPayload(accessToken);
  if (!claims || isExpired(claims)) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    if (!refreshToken) {
      const response = NextResponse.json(
        { message: "Token inválido." },
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

    refreshedSession = refreshed;
    ({ accessToken } = refreshed);
    claims = decodeJwtPayload(accessToken);
  }

  if (!claims) {
    return NextResponse.json({ message: "Token inválido." }, { status: 401 });
  }

  // Tenta primeiro nos claims do JWT; cai para o cookie de role (set pelo
  // login route a partir do envelope do backend) se o JWT não tiver o claim.
  const role =
    extractUserRole(claims) ??
    extractUserRole({ role: cookieStore.get(ROLE_COOKIE_NAME)?.value });
  if (!role) {
    return NextResponse.json(
      { message: "Sem role na sessão." },
      { status: 401 },
    );
  }

  const userName =
    pickClaim(
      claims,
      "unique_name",
      "userName",
      "name",
      "preferred_username",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    ) ??
    cookieStore.get(USER_NAME_COOKIE)?.value ??
    "Usuário";

  const id = pickClaim(
    claims,
    "sub",
    "nameid",
    "userId",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  );

  const { exp } = claims;
  const expiresAt = typeof exp === "number" ? exp : null;

  const body: SessionResponse = {
    user: { id, userName, role },
    expiresAt,
  };
  const response = NextResponse.json(body);
  if (refreshedSession) {
    setAuthCookies(response, {
      accessExpiresAt: refreshedSession.accessExpiresAt,
      accessToken: refreshedSession.accessToken,
      refreshExpiresAt: refreshedSession.refreshExpiresAt,
      refreshToken: refreshedSession.refreshToken,
      userName,
    });
  }
  return response;
}
