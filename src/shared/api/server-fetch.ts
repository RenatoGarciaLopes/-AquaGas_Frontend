import { cookies } from "next/headers";

import { getApiBaseUrl } from "@/shared/lib/env";
import {
  ACCESS_TOKEN_COOKIE_CANDIDATES,
  applyBearerToken,
  getCookieValue,
} from "@/shared/auth/session";

import { ApiError, type ApiFieldErrors } from "@/shared/api/errors";

type ServerFetchParams = Record<
  string,
  boolean | null | number | string | undefined
>;

type ServerFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  params?: ServerFetchParams;
};

type ApiErrorEnvelope = {
  code?: string;
  error?: {
    code?: string;
    fieldErrors?: ApiFieldErrors;
    message?: string;
  } | null;
  fieldErrors?: ApiFieldErrors;
  message?: string;
};

function buildUrl(path: string, params?: ServerFetchParams) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
}

function parsePayload(text: string) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const errorPayload = payload as ApiErrorEnvelope;
  return errorPayload.error?.message ?? errorPayload.message ?? fallback;
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
) {
  const { params, ...requestOptions } = options;
  const requestCookies = await cookies();
  const headers = new Headers(requestOptions.headers);
  const cookieHeader = requestCookies.toString();

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  applyBearerToken(
    headers,
    getCookieValue(requestCookies, ACCESS_TOKEN_COOKIE_CANDIDATES),
  );

  const response = await fetch(buildUrl(path, params), {
    ...requestOptions,
    cache: requestOptions.cache ?? "no-store",
    headers,
  });
  const payload = parsePayload(await response.text());

  if (!response.ok) {
    const errorPayload =
      payload && typeof payload === "object"
        ? (payload as ApiErrorEnvelope)
        : undefined;

    throw new ApiError({
      code: errorPayload?.error?.code ?? errorPayload?.code,
      fieldErrors:
        errorPayload?.error?.fieldErrors ?? errorPayload?.fieldErrors,
      message: getErrorMessage(payload, "Não foi possível carregar os dados."),
      status: response.status,
    });
  }

  return payload as T;
}
