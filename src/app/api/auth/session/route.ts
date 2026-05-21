import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
} from "@/shared/auth/cookies";
import {
  type UserRole,
  decodeJwtPayload,
  extractUserRole,
} from "@/shared/auth/roles";

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

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "Sem sessão." }, { status: 401 });
  }

  const claims = decodeJwtPayload(accessToken);
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
  return NextResponse.json(body);
}
