import { ApiError } from "@/shared/api/errors";
import { apiGet, apiPost } from "@/shared/api/client";

import type { SessionUser } from "@/features/auth/stores/auth-store";

type SessionResponse = {
  user: SessionUser;
  expiresAt: number | null;
};

type LoginInput = {
  userName: string;
  password: string;
};

/**
 * Faz login e devolve a sessão hidratada via /api/auth/session.
 *
 * Etapas:
 * 1. POST /api/auth/login (Next handler) — autentica no backend, seta cookies
 *    httpOnly de access/refresh/role/userName.
 * 2. GET /api/auth/session — decodifica o JWT do cookie e devolve o user.
 *
 * Esse fan-out evita que o login form precise saber a estrutura do JWT.
 */
export async function login(input: LoginInput): Promise<SessionUser> {
  try {
    await apiPost("/api/auth/login", input);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError({
        ...error,
        message: "Usuário ou senha incorretos.",
        status: 401,
      });
    }
    throw error;
  }

  const session = await apiGet<SessionResponse>("/api/auth/session");
  return session.user;
}

export async function logout(): Promise<void> {
  await apiPost("/api/auth/logout");
}

export async function getSession(): Promise<SessionResponse> {
  return apiGet<SessionResponse>("/api/auth/session");
}
