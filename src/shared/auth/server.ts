// eslint-disable-next-line import/no-unresolved
import "server-only";
import { cookies } from "next/headers";

import { type UserRole, extractUserRole, decodeJwtPayload } from "./roles";
import {
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
  ACCESS_COOKIE_NAME,
} from "./cookies";

/**
 * Helpers de sessão que só podem rodar em Server Components ou Route Handlers
 * (usam `next/headers`). Importar daqui em qualquer arquivo com `"use client"`
 * resulta em erro de build.
 */

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const store = await cookies();

  const cookieRole = store.get(ROLE_COOKIE_NAME)?.value;
  if (cookieRole) {
    const fromCookie = extractUserRole({ role: cookieRole });
    if (fromCookie) return fromCookie;
  }

  const accessToken = store.get(ACCESS_COOKIE_NAME)?.value;
  if (accessToken) {
    const fromJwt = extractUserRole(decodeJwtPayload(accessToken));
    if (fromJwt) return fromJwt;
  }

  return null;
}

export type SessionUser = {
  userName: string;
  role: UserRole | null;
};

export async function getSessionUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const userName = cookieStore.get(USER_NAME_COOKIE)?.value ?? "Usuário";
  const role = await getCurrentUserRole();
  return { userName, role };
}
