import { getApiBaseUrl } from "@/shared/lib/env";

import { readRefreshCookie } from "@/shared/auth/backend-cookies";

type RefreshPayload = {
  data?: { accessToken?: string; expiresAt?: number } | null;
  error?: { code?: string; message?: string } | null;
  success?: boolean;
};

export type RefreshSessionResult =
  | {
      ok: true;
      accessToken: string;
      accessExpiresAt?: number;
      refreshExpiresAt?: Date;
      refreshToken?: string;
    }
  | {
      ok: false;
      payload: unknown;
      status: number;
    };

const inFlightRefreshes = new Map<string, Promise<RefreshSessionResult>>();

async function requestRefresh(
  refreshToken: string,
): Promise<RefreshSessionResult> {
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      cache: "no-store",
      headers: {
        cookie: `refreshToken=${refreshToken}`,
      },
      method: "POST",
    });
  } catch {
    return {
      ok: false,
      payload: {
        message: "Não foi possível alcançar o servidor de autenticação.",
      },
      status: 503,
    };
  }

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    return {
      ok: false,
      payload: payload ?? { message: text },
      status: response.status,
    };
  }

  const data = (payload as RefreshPayload | null)?.data;
  const accessToken = data?.accessToken;
  if (!accessToken) {
    return {
      ok: false,
      payload: { message: "Resposta de refresh inválida." },
      status: 502,
    };
  }

  const rotatedRefresh = readRefreshCookie(response);
  return {
    ok: true,
    accessExpiresAt: data?.expiresAt,
    accessToken,
    refreshExpiresAt: rotatedRefresh?.expires,
    refreshToken: rotatedRefresh?.value,
  };
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function refreshSessionOnce(
  refreshToken: string,
): Promise<RefreshSessionResult> {
  const pending = inFlightRefreshes.get(refreshToken);
  if (pending) return pending;

  const promise = requestRefresh(refreshToken);
  inFlightRefreshes.set(refreshToken, promise);
  try {
    return await promise;
  } finally {
    inFlightRefreshes.delete(refreshToken);
  }
}
