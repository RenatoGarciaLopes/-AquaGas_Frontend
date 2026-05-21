import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { USER_NAME_COOKIE, ACCESS_COOKIE_NAME } from "@/shared/auth/cookies";
import {
  type UserRole,
  extractUserRole,
  decodeJwtPayload,
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

  const role = extractUserRole(claims);
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
