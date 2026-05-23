import { cookies } from "next/headers";

import { getApiBaseUrl } from "@/shared/lib/env";

import { ApiError, type ApiFieldErrors } from "@/shared/api/errors";

// ─── Tipos internos ───────────────────────────────────────────────────────────

type ServerFetchParams = Record<
  string,
  boolean | null | number | string | undefined
>;

export type ServerFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  params?: ServerFetchParams;
};

// Shape do envelope de erro do backend (success=false)
type BackendErrorEnvelope = {
  error?: {
    code?: string;
    details?:
      | Array<{ field: string; message?: string[]; messages?: string[] }>
      | Record<string, string[]>
      | null;
    message?: string;
  } | null;
  message?: string; // fallback para respostas não-envelopadas
  success?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUrl(path: string, params?: ServerFetchParams): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getApiBaseUrl()}${normalizedPath}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

function parsePayload(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const env = payload as BackendErrorEnvelope;
  return env.error?.message ?? env.message ?? fallback;
}

// Transforma details: [{field, messages[]}] → fieldErrors: {field: messages[]}
function extractFieldErrors(payload: unknown): ApiFieldErrors | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const details = (payload as BackendErrorEnvelope).error?.details;
  if (!details) return undefined;
  if (Array.isArray(details)) {
    return Object.fromEntries(
      details.map(({ field, message, messages }) => [
        field,
        messages ?? message ?? [],
      ]),
    );
  }
  return details;
}

// ─── serverFetch ─────────────────────────────────────────────────────────────

/**
 * Cliente HTTP para Server Components e Route Handlers.
 * Injeta automaticamente o access token como Bearer — nunca repassa cookies
 * brutos ao backend.
 */
export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { params, ...requestOptions } = options;

  const requestCookies = await cookies();
  const headers = new Headers(requestOptions.headers);

  // Apenas o Bearer token é enviado; refresh token permanece exclusivo
  // do Next.js e nunca trafega para o backend.
  const accessToken = requestCookies.get("aquagas_access_token")?.value;
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  if (!headers.has("content-type") && requestOptions.body) {
    headers.set("content-type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      ...requestOptions,
      cache: requestOptions.cache ?? "no-store",
      headers,
    });
  } catch {
    // TypeError de rede: backend inacessível, porta errada, etc.
    throw new ApiError({
      message: `Não foi possível conectar ao servidor. Verifique se o backend está em execução (${getApiBaseUrl()}).`,
      status: 503,
    });
  }

  const payload = parsePayload(await response.text());

  if (!response.ok) {
    throw new ApiError({
      code: (payload as BackendErrorEnvelope | null)?.error?.code,
      fieldErrors: extractFieldErrors(payload),
      message: getErrorMessage(payload, "Não foi possível carregar os dados."),
      status: response.status,
    });
  }

  return payload as T;
}
