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

// .NET emite roles em claims com URIs longas; cobrir as duas formas usuais.
const ROLE_CLAIM_URI =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function normalizeRoleValue(value: unknown): UserRole | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const role =
        typeof item === "string"
          ? normalizeRole(item.replace(/^ROLE_/, ""))
          : null;
      if (role) return role;
    }
    return null;
  }
  if (typeof value === "string") {
    return normalizeRole(value.replace(/^ROLE_/, ""));
  }
  return null;
}

/**
 * Procura a role em um payload arbitrário (response do backend ou claims do JWT).
 * Suporta `role`, `perfil`, `authority`, `roles[]`, claim URI do .NET, e
 * qualquer chave que termine em `/role` ou `/roles`. Aceita também valor como
 * array (múltiplas roles).
 */
function extractRoleFromRecord(
  record: Record<string, unknown>,
): UserRole | null {
  const direct =
    normalizeRoleValue(record.role) ??
    normalizeRoleValue(record.perfil) ??
    normalizeRoleValue(record.authority) ??
    normalizeRoleValue(record[ROLE_CLAIM_URI]);
  if (direct) return direct;

  // Fallback: qualquer chave terminando em /role ou /roles (case-insensitive).
  for (const [key, value] of Object.entries(record)) {
    const lower = key.toLowerCase();
    if (lower.endsWith("/role") || lower.endsWith("/roles")) {
      const role = normalizeRoleValue(value);
      if (role) return role;
    }
  }

  const nested =
    record.data ?? record.user ?? record.usuario ?? record.employee;
  if (nested && typeof nested === "object") {
    const found = extractRoleFromRecord(nested as Record<string, unknown>);
    if (found) return found;
  }

  const roles = record.roles ?? record.authorities;
  if (roles) {
    const fromArr = normalizeRoleValue(roles);
    if (fromArr) return fromArr;
    if (Array.isArray(roles)) {
      for (const item of roles) {
        if (item && typeof item === "object") {
          const role = extractRoleFromRecord(item as Record<string, unknown>);
          if (role) return role;
        }
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
