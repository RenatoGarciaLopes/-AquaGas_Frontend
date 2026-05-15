import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/";
const REFRESH_COOKIE_NAME =
  process.env.AQUAGAS_REFRESH_COOKIE_NAME ?? "aquagas_refresh_token";

export function middleware(request: NextRequest) {
  const refreshCookie = request.cookies.get(REFRESH_COOKIE_NAME);
  const isLoginRoute = request.nextUrl.pathname.startsWith(LOGIN_PATH);

  const isExpiredRedirect = request.nextUrl.searchParams.get("expired") === "1";

  if (isLoginRoute && refreshCookie && !isExpiredRedirect) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  if (!isLoginRoute && !refreshCookie) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api/auth|favicon).*)"],
};
