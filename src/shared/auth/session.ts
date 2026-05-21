export const ACCESS_TOKEN_COOKIE_NAME =
  process.env.AQUAGAS_ACCESS_COOKIE_NAME ?? "aquagas_access_token";
export const REFRESH_TOKEN_COOKIE_NAME =
  process.env.AQUAGAS_REFRESH_COOKIE_NAME ?? "aquagas_refresh_token";

export const ACCESS_TOKEN_COOKIE_CANDIDATES = [
  ACCESS_TOKEN_COOKIE_NAME,
  "aq_access",
  "accessToken",
] as const;

export const AUTH_COOKIE_CANDIDATES = [
  REFRESH_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_NAME,
  "aq_refresh",
  "aq_access",
  "refreshToken",
  "accessToken",
] as const;

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getCookieValue(
  cookies: CookieReader,
  names: readonly string[],
) {
  for (const name of names) {
    const value = cookies.get(name)?.value;

    if (value) {
      return value;
    }
  }

  return undefined;
}

export function extractAccessToken(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (typeof payload.accessToken === "string") {
    return payload.accessToken;
  }

  if (isRecord(payload.data)) {
    return extractAccessToken(payload.data);
  }

  return null;
}

export function applyBearerToken(headers: Headers, token: string | undefined) {
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  }
}
