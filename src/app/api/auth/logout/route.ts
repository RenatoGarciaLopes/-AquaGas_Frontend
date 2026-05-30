import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/shared/lib/env";

import {
  AUTH_COOKIE_NAMES,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} from "@/shared/auth/cookies";

/**
 * Avisa o backend que o refresh token deve ser revogado e, em seguida, limpa
 * todos os cookies de sessão localmente.
 *
 * Se o backend falhar (rede caída, 5xx), ainda limpamos os cookies para que o
 * usuário consiga continuar — mas isso fica em um header de debug, não silente.
 */
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  let backendStatus: number | "skipped" | "error" = "skipped";

  if (refreshToken) {
    try {
      const headers = new Headers({
        "content-type": "application/json",
        // Backend espera o cookie com o nome original `refreshToken`.
        cookie: `refreshToken=${refreshToken}`,
      });
      if (accessToken) {
        headers.set("authorization", `Bearer ${accessToken}`);
      }

      const backendResponse = await fetch(
        `${getApiBaseUrl()}/api/auth/logout`,
        {
          method: "POST",
          headers,
          cache: "no-store",
        },
      );
      backendStatus = backendResponse.status;
    } catch {
      backendStatus = "error";
    }
  }

  const response = NextResponse.json({ success: true });
  response.headers.set("x-backend-logout", String(backendStatus));

  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  // Legados: cookies antigos que possam ter sobrado em sessões anteriores.
  response.cookies.delete("aq_access");
  response.cookies.delete("aq_refresh");

  return response;
}
