import { Buffer } from "node:buffer";
import { cookies } from "next/headers";

export const ROLE_COOKIE_NAME = "aquagas_user_role";

export type UserRole = "FUNCIONARIO" | "GERENTE";

const JWT_COOKIE_CANDIDATES = [
  "aquagas_access_token",
  "aquagas_refresh_token",
  "aq_access",
  "aq_refresh",
  "accessToken",
  "refreshToken",
];

function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const role = value.trim().toUpperCase();

  if (role === "GERENTE" || role === "MANAGER") {
    return "GERENTE";
  }

  if (role === "FUNCIONARIO" || role === "EMPLOYEE") {
    return "FUNCIONARIO";
  }

  return null;
}

function extractRoleFromRecord(
  record: Record<string, unknown>,
): UserRole | null {
  const directRole =
    normalizeRole(record.role) ??
    normalizeRole(record.perfil) ??
    normalizeRole(record.authority);

  if (directRole) {
    return directRole;
  }

  const nestedUser =
    record.data ?? record.user ?? record.usuario ?? record.employee;

  if (nestedUser && typeof nestedUser === "object") {
    const nestedRole = extractRoleFromRecord(
      nestedUser as Record<string, unknown>,
    );

    if (nestedRole) {
      return nestedRole;
    }
  }

  const roles = record.roles ?? record.authorities;

  if (Array.isArray(roles)) {
    return roles.reduce<UserRole | null>((foundRole, item) => {
      if (foundRole) {
        return foundRole;
      }

      if (typeof item === "string") {
        return normalizeRole(item.replace(/^ROLE_/, ""));
      }

      if (item && typeof item === "object") {
        return extractRoleFromRecord(item as Record<string, unknown>);
      }

      return null;
    }, null);
  }

  if (typeof record.accessToken === "string") {
    return extractUserRole(decodeJwtPayload(record.accessToken));
  }

  return null;
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractUserRole(payload: unknown): UserRole | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return extractRoleFromRecord(payload as Record<string, unknown>);
}

export function roleFromLoginHint(userName: string | undefined) {
  return userName?.toLowerCase().includes("gerente")
    ? "GERENTE"
    : "FUNCIONARIO";
}

export function isGerente(role: UserRole) {
  return role === "GERENTE";
}

export async function getCurrentUserRole(): Promise<UserRole> {
  const cookieStore = await cookies();
  const roleCookie = normalizeRole(cookieStore.get(ROLE_COOKIE_NAME)?.value);

  if (roleCookie) {
    return roleCookie;
  }

  for (const cookieName of JWT_COOKIE_CANDIDATES) {
    const token = cookieStore.get(cookieName)?.value;

    if (!token) {
      continue;
    }

    const role = extractUserRole(decodeJwtPayload(token));

    if (role) {
      return role;
    }
  }

  return "FUNCIONARIO";
}
