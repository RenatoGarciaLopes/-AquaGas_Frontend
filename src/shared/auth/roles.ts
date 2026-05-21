import { Buffer } from "node:buffer";

export type UserRole = "FUNCIONARIO" | "GERENTE";

/**
 * Normaliza qualquer string vinda do backend (Manager/Employee, GERENTE/FUNCIONARIO)
 * para o nome canônico do frontend.
 */
function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;

  const role = value.trim().toUpperCase();

  if (role === "GERENTE" || role === "MANAGER") return "GERENTE";
  if (role === "FUNCIONARIO" || role === "EMPLOYEE") return "FUNCIONARIO";

  return null;
}

/**
 * Procura a role em um payload arbitrário (response do backend ou claims do JWT).
 * Suporta `role`, `perfil`, `authority`, `roles[]`, e `data.user.role` aninhado.
 */
function extractRoleFromRecord(
  record: Record<string, unknown>,
): UserRole | null {
  const direct =
    normalizeRole(record.role) ??
    normalizeRole(record.perfil) ??
    normalizeRole(record.authority);
  if (direct) return direct;

  const nested =
    record.data ?? record.user ?? record.usuario ?? record.employee;
  if (nested && typeof nested === "object") {
    const found = extractRoleFromRecord(nested as Record<string, unknown>);
    if (found) return found;
  }

  const roles = record.roles ?? record.authorities;
  if (Array.isArray(roles)) {
    for (const item of roles) {
      if (typeof item === "string") {
        const role = normalizeRole(item.replace(/^ROLE_/, ""));
        if (role) return role;
      } else if (item && typeof item === "object") {
        const role = extractRoleFromRecord(item as Record<string, unknown>);
        if (role) return role;
      }
    }
  }

  if (typeof record.accessToken === "string") {
    return extractUserRole(decodeJwtPayload(record.accessToken));
  }

  return null;
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractUserRole(payload: unknown): UserRole | null {
  if (!payload || typeof payload !== "object") return null;
  return extractRoleFromRecord(payload as Record<string, unknown>);
}

export function isGerente(role: UserRole | null): boolean {
  return role === "GERENTE";
}

export function roleToLabel(role: UserRole | null): string {
  if (role === "GERENTE") return "Gerente";
  if (role === "FUNCIONARIO") return "Funcionário";
  return "—";
}
