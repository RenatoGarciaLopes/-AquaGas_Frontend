"use client";

import { toast } from "sonner";
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { ApiError, type ApiFieldErrors } from "@/shared/api/errors";

/**
 * Cliente HTTP para ilhas (Client Components).
 *
 * Importante: este client chama as Route Handlers do Next (prefixo `/api/...`),
 * não o backend diretamente. Os route handlers proxy adicionam o Bearer a
 * partir do cookie httpOnly de access. O navegador nunca vê o token.
 *
 * Para Server Components, usar `serverFetch` (chama o backend direto, com
 * cookies do Next).
 */

const SESSION_EXPIRED_EVENT = "auth:session-expired";

let isRefreshing = false;
let pendingResolvers: Array<(success: boolean) => void> = [];
let sessionExpiredDispatched = false;

function flushPending(success: boolean) {
  const resolvers = pendingResolvers;
  pendingResolvers = [];
  for (const resolve of resolvers) resolve(success);
}

function waitForRefresh(): Promise<boolean> {
  return new Promise((resolve) => pendingResolvers.push(resolve));
}

async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

function dispatchSessionExpired() {
  if (sessionExpiredDispatched) return;
  sessionExpiredDispatched = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}

// ─── erro normalizado ────────────────────────────────────────────────────────

type BackendErrorPayload = {
  error?: {
    code?: string;
    details?: Array<{ field: string; messages: string[] }> | null;
    message?: string;
  } | null;
  message?: string;
};

function extractFieldErrors(payload: unknown): ApiFieldErrors | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const details = (payload as BackendErrorPayload).error?.details;
  if (!details?.length) return undefined;
  return Object.fromEntries(
    details.map(({ field, messages }) => [field, messages]),
  );
}

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const payload = error.response?.data as BackendErrorPayload | undefined;

  const message =
    payload?.error?.message ??
    payload?.message ??
    (status === 0
      ? "Não foi possível conectar ao servidor."
      : `Erro ${status}.`);

  return new ApiError({
    code: payload?.error?.code,
    fieldErrors: extractFieldErrors(payload),
    message,
    status: status || 503,
  });
}

// ─── client ──────────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: "/",
  withCredentials: true,
  timeout: 15_000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status ?? 0;

    // 401: tenta refresh uma vez e refaz a request.
    const isAuthEndpoint =
      typeof original?.url === "string" && original.url.includes("/api/auth/");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (isRefreshing) {
        const ok = await waitForRefresh();
        if (!ok) {
          dispatchSessionExpired();
          throw toApiError(error);
        }
        return apiClient.request(original);
      }

      isRefreshing = true;
      try {
        const ok = await refreshSession();
        flushPending(ok);
        if (!ok) {
          dispatchSessionExpired();
          throw toApiError(error);
        }
        return apiClient.request(original);
      } finally {
        isRefreshing = false;
      }
    }

    // 403: toast de permissão (UI), mas ainda joga o erro para quem chamou.
    if (status === 403) {
      toast.error("Você não tem permissão para esta ação.");
    } else if (status >= 500) {
      toast.error("Erro interno do servidor. Tente novamente.");
    }

    throw toApiError(error);
  },
);

/**
 * Helper tipado para GET — retorna a resposta direto sem desempacotar
 * `ApiResponse` (mantém compatibilidade com endpoints sem envelope).
 */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T = void>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

/** Permite que o SessionExpiredDialog "consuma" o sinal e libere para nova rodada. */
export function resetSessionExpiredFlag() {
  sessionExpiredDispatched = false;
}

export { SESSION_EXPIRED_EVENT };
