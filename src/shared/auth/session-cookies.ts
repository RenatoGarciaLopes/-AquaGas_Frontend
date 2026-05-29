import { type NextResponse } from "next/server";

import { extractUserRole, decodeJwtPayload } from "@/shared/auth/roles";
import {
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
  AUTH_COOKIE_NAMES,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/shared/auth/cookies";

type SetAuthCookiesInput = {
  accessToken: string;
  accessExpiresAt?: number;
  refreshExpiresAt?: Date;
  refreshToken?: string;
  userName?: string;
};

function cookieOptions(expires?: Date) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    secure: isProduction,
  };
}

function pickStringClaim(
  claims: Record<string, unknown> | null,
  ...keys: string[]
): string | null {
  if (!claims) return null;
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

export function setAuthCookies(
  response: NextResponse,
  input: SetAuthCookiesInput,
) {
  const claims = decodeJwtPayload(input.accessToken);
  const role = extractUserRole(claims);
  const userName =
    input.userName ??
    pickStringClaim(
      claims,
      "unique_name",
      "userName",
      "name",
      "preferred_username",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    );

  response.cookies.set(ACCESS_COOKIE_NAME, input.accessToken, {
    ...cookieOptions(
      input.accessExpiresAt
        ? new Date(input.accessExpiresAt * 1000)
        : undefined,
    ),
  });

  if (input.refreshToken) {
    response.cookies.set(REFRESH_COOKIE_NAME, input.refreshToken, {
      ...cookieOptions(input.refreshExpiresAt),
    });
  }

  if (role) {
    response.cookies.set(ROLE_COOKIE_NAME, role, cookieOptions());
  }

  if (userName) {
    response.cookies.set(USER_NAME_COOKIE, userName, cookieOptions());
  }
}

export function clearAuthCookies(response: NextResponse) {
  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  response.cookies.delete("aq_access");
  response.cookies.delete("aq_refresh");
}
