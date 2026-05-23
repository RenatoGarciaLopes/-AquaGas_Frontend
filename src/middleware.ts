import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import { readRefreshCookie } from "@/shared/auth/backend-cookies";
import {
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/shared/auth/cookies";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/";
const REFRESH_SKEW_SECONDS = 30;

type RefreshPayload = {
  data?: { accessToken?: string; expiresAt?: number } | null;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function needsRefresh(accessToken: string | undefined): boolean {
  if (!accessToken) return true;
  const exp = decodeJwtPayload(accessToken)?.exp;
  if (typeof exp !== "number") return true;
  return exp <= Math.floor(Date.now() / 1000) + REFRESH_SKEW_SECONDS;
}

function normalizeRole(value: unknown): "FUNCIONARIO" | "GERENTE" | null {
  if (typeof value !== "string") return null;
  const upper = value.trim().toUpperCase();
  if (upper === "GERENTE" || upper === "MANAGER") return "GERENTE";
  if (upper === "FUNCIONARIO" || upper === "EMPLOYEE") return "FUNCIONARIO";
  return null;
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

function setCookie(
  response: NextResponse,
  name: string,
  value: string,
  expires?: Date,
) {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(name, value, {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
  });
}

function setRequestCookie(headers: Headers, name: string, value: string) {
  const cookies = new Map<string, string>();
  const raw = headers.get("cookie") ?? "";

  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    cookies.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }

  cookies.set(name, value);
  headers.set(
    "cookie",
    Array.from(cookies, ([key, cookieValue]) => `${key}=${cookieValue}`).join(
      "; ",
    ),
  );
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  response.cookies.delete(ROLE_COOKIE_NAME);
  response.cookies.delete(USER_NAME_COOKIE);
  response.cookies.delete("aq_access");
  response.cookies.delete("aq_refresh");
}

async function tryRefresh(refreshToken: string): Promise<{
  accessExpiresAt?: number;
  accessToken: string;
  refreshExpiresAt?: Date;
  refreshToken?: string;
} | null> {
  try {
    const backendResponse = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      cache: "no-store",
      headers: { cookie: `refreshToken=${refreshToken}` },
      method: "POST",
    });

    const payload = (await backendResponse
      .json()
      .catch(() => null)) as RefreshPayload | null;
    const accessToken = payload?.data?.accessToken;
    if (!backendResponse.ok || !accessToken) return null;

    const rotatedRefresh = readRefreshCookie(backendResponse);
    return {
      accessExpiresAt: payload?.data?.expiresAt,
      accessToken,
      refreshExpiresAt: rotatedRefresh?.expires,
      refreshToken: rotatedRefresh?.value,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const refreshCookie = request.cookies.get(REFRESH_COOKIE_NAME);
  const accessCookie = request.cookies.get(ACCESS_COOKIE_NAME);
  const isLoginRoute = request.nextUrl.pathname.startsWith(LOGIN_PATH);
  const isExpiredRedirect = request.nextUrl.searchParams.get("expired") === "1";

  if (isLoginRoute && refreshCookie && !isExpiredRedirect) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (!isLoginRoute && !refreshCookie) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (!isLoginRoute && needsRefresh(accessCookie?.value)) {
    const refreshed = refreshCookie
      ? await tryRefresh(refreshCookie.value)
      : null;
    if (!refreshed) {
      const response = NextResponse.redirect(
        new URL(`${LOGIN_PATH}?expired=1`, request.url),
      );
      clearAuthCookies(response);
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    const claims = decodeJwtPayload(refreshed.accessToken);
    const role = normalizeRole(
      pickStringClaim(
        claims,
        "role",
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      ),
    );
    const userName = pickStringClaim(
      claims,
      "unique_name",
      "userName",
      "name",
      "preferred_username",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    );

    setRequestCookie(requestHeaders, ACCESS_COOKIE_NAME, refreshed.accessToken);
    if (refreshed.refreshToken) {
      setRequestCookie(
        requestHeaders,
        REFRESH_COOKIE_NAME,
        refreshed.refreshToken,
      );
    }
    if (role) setRequestCookie(requestHeaders, ROLE_COOKIE_NAME, role);
    if (userName) setRequestCookie(requestHeaders, USER_NAME_COOKIE, userName);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    setCookie(
      response,
      ACCESS_COOKIE_NAME,
      refreshed.accessToken,
      refreshed.accessExpiresAt
        ? new Date(refreshed.accessExpiresAt * 1000)
        : undefined,
    );
    if (refreshed.refreshToken) {
      setCookie(
        response,
        REFRESH_COOKIE_NAME,
        refreshed.refreshToken,
        refreshed.refreshExpiresAt,
      );
    }
    if (role) setCookie(response, ROLE_COOKIE_NAME, role);
    if (userName) setCookie(response, USER_NAME_COOKIE, userName);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon).*)"],
};
