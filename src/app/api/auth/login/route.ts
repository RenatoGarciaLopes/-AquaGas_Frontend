import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import { USER_NAME_COOKIE } from "@/shared/auth/session";
import {
  extractUserRole,
  ROLE_COOKIE_NAME,
  roleFromLoginHint,
} from "@/shared/auth/roles";

const REFRESH_COOKIE_NAME =
  process.env.AQUAGAS_REFRESH_COOKIE_NAME ?? "aquagas_refresh_token";

type LoginRequestBody = {
  userName?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ message: "Payload inválido." }, { status: 400 });
  }

  if (!body.userName || !body.password) {
    return NextResponse.json(
      { message: "Usuário e senha são obrigatórios." },
      { status: 400 },
    );
  }

  const backendResponse = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      userName: body.userName,
      password: body.password,
    }),
    cache: "no-store",
  });

  const responseText = await backendResponse.text();
  const setCookie = backendResponse.headers.get("set-cookie");

  let payload: unknown = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { message: responseText };
    }
  }

  const response = NextResponse.json(payload, {
    status: backendResponse.status,
  });

  if (setCookie) {
    const tokenMatch = setCookie.match(/refreshToken=([^;]+)/);
    const expiresMatch = setCookie.match(/expires=([^;]+)/);

    if (tokenMatch) {
      const isProduction = process.env.NODE_ENV === "production";
      response.cookies.set(REFRESH_COOKIE_NAME, tokenMatch[1], {
        httpOnly: true,
        path: "/",
        sameSite: isProduction ? "strict" : "lax",
        secure: isProduction,
        expires: expiresMatch ? new Date(expiresMatch[1]) : undefined,
      });
    }
  }

  if (backendResponse.ok) {
    response.cookies.set(
      ROLE_COOKIE_NAME,
      extractUserRole(payload) ?? roleFromLoginHint(body.userName),
      { httpOnly: true, path: "/", sameSite: "lax" },
    );

    response.cookies.set(USER_NAME_COOKIE, body.userName, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    const payloadData = (
      payload as { data?: { accessToken?: string; expiresAt?: number } }
    )?.data;

    if (payloadData?.accessToken) {
      response.cookies.set("aquagas_access_token", payloadData.accessToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        expires: payloadData.expiresAt
          ? new Date(payloadData.expiresAt * 1000)
          : undefined,
      });
    }
  } else {
    response.cookies.delete(ROLE_COOKIE_NAME);
    response.cookies.delete("aquagas_access_token");
  }

  return response;
}
