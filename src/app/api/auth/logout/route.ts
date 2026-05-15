import { NextResponse } from "next/server";

import { ROLE_COOKIE_NAME } from "@/shared/auth/roles";
import { USER_NAME_COOKIE } from "@/shared/auth/session";

const AUTH_COOKIES = [
  "aq_refresh",
  "aq_access",
  "aquagas_access_token",
  "aquagas_refresh_token",
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
] as const;

export async function POST() {
  const response = NextResponse.json({ success: true });
  for (const name of AUTH_COOKIES) {
    response.cookies.delete(name);
  }
  return response;
}
