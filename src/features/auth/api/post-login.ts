import type { LoginSchema } from "@/features/auth/schemas/login-schema";

type LoginData = {
  accessToken: string;
  [key: string]: unknown;
};

type LoginApiEnvelope = {
  success?: boolean;
  data?: LoginData | null;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  } | null;
  message?: string;
};

const AUTH_DEFAULT_ERROR = "Nao foi possivel autenticar.";

function getReadableAuthError(payload: LoginApiEnvelope) {
  const { error, message } = payload;

  if (error?.code === "UNAUTHORIZED") {
    return "Usuario ou senha incorretos.";
  }
  return message;
}

export async function postLogin(data: LoginSchema) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = (await response.json().catch(() => ({}))) as LoginApiEnvelope;

  if (!response.ok) {
    throw new Error(getReadableAuthError(payload) ?? AUTH_DEFAULT_ERROR);
  }

  if (payload.data && typeof payload.data.accessToken === "string") {
    return {
      accessToken: payload.data.accessToken,
    };
  }

  throw new Error("Resposta de autenticacao invalida.");
}
