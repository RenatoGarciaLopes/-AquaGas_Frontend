"use client";

import type { ReactNode } from "react";

import { useHasRole } from "@/shared/hooks/use-has-role";

import type { UserRole } from "@/shared/auth/roles";

type RoleGuardProps = {
  roles: UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Esconde a UI quando o usuário não tem nenhuma das roles permitidas.
 *
 * Use para ações sensíveis (botões de criar/editar/desativar) — a autoridade
 * final permanece no backend, isto é só para evitar mostrar UI inacessível.
 */
export function RoleGuard({
  roles,
  fallback = null,
  children,
}: RoleGuardProps) {
  const allowed = useHasRole(...roles);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
