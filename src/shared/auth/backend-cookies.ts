/**
 * Helpers para extrair cookies que o backend devolve via Set-Cookie em
 * respostas de `/api/auth/login` e `/api/auth/refresh`.
 *
 * Usar `Headers.getSetCookie()` (Node 18+ / Next 14+) em vez de regex —
 * múltiplos Set-Cookie chegam como itens separados, e atributos vêm como
 * pares `chave=valor` separados por `;`.
 */

const BACKEND_REFRESH_COOKIE_NAMES = ["refreshToken", "refresh_token"];

export type BackendRefreshCookie = {
  value: string;
  expires?: Date;
};

export function readRefreshCookie(
  response: Response,
): BackendRefreshCookie | null {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const list = headers.getSetCookie?.() ?? [];

  for (const raw of list) {
    const [pair, ...attrs] = raw.split(";").map((part) => part.trim());
    if (!pair) continue;
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    const name = pair.slice(0, eq);
    if (!BACKEND_REFRESH_COOKIE_NAMES.includes(name)) continue;

    const expiresAttr = attrs
      .map((attr) => attr.split("="))
      .find(([key]) => key.toLowerCase() === "expires");
    const expires = expiresAttr?.[1] ? new Date(expiresAttr[1]) : undefined;

    return { value: pair.slice(eq + 1), expires };
  }

  return null;
}
