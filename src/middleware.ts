import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_CANDIDATES, getCookieValue } from "@/shared/auth/session";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/";

export function middleware(request: NextRequest) {
  const authCookie = getCookieValue(request.cookies, AUTH_COOKIE_CANDIDATES);
  const isLoginRoute = request.nextUrl.pathname.startsWith(LOGIN_PATH);

  if (isLoginRoute && authCookie) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (!isLoginRoute && !authCookie) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api/auth|favicon).*)"],
};
