import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/shared/auth/cookies";
import { refreshSessionOnce } from "@/shared/auth/server-refresh";
import {
  clearAuthCookies,
  setAuthCookies,
} from "@/shared/auth/session-cookies";

type ProxyOptions = {
  body?: string;
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  path: string;
};

function buildHeaders(request: NextRequest, accessToken?: string) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  return headers;
}

async function callBackend(
  request: NextRequest,
  options: ProxyOptions,
  accessToken?: string,
) {
  return fetch(`${getApiBaseUrl()}${options.path}`, {
    body: options.body,
    cache: "no-store",
    headers: buildHeaders(request, accessToken),
    method: options.method,
  });
}

async function toNextResponse(response: Response) {
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;
  return NextResponse.json(payload, { status: response.status });
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export async function proxyBackendRequest(
  request: NextRequest,
  options: ProxyOptions,
) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  let backendResponse = await callBackend(request, options, accessToken);
  if (backendResponse.status !== 401) {
    return toNextResponse(backendResponse);
  }

  if (!refreshToken) {
    const response = await toNextResponse(backendResponse);
    response.headers.set("x-auth-refresh-failed", "1");
    clearAuthCookies(response);
    return response;
  }

  const refreshed = await refreshSessionOnce(refreshToken);
  if (!refreshed.ok) {
    const response = NextResponse.json(refreshed.payload, {
      status: refreshed.status,
    });
    response.headers.set("x-auth-refresh-failed", "1");
    clearAuthCookies(response);
    return response;
  }

  backendResponse = await callBackend(request, options, refreshed.accessToken);
  const response = await toNextResponse(backendResponse);

  setAuthCookies(response, {
    accessExpiresAt: refreshed.accessExpiresAt,
    accessToken: refreshed.accessToken,
    refreshExpiresAt: refreshed.refreshExpiresAt,
    refreshToken: refreshed.refreshToken,
  });

  if (backendResponse.status === 401) {
    response.headers.set("x-auth-refresh-failed", "1");
    clearAuthCookies(response);
  }

  return response;
}
