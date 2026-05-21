"use client";

import type { UserRole } from "@/shared/auth/roles";

import { useAuthStore } from "@/features/auth/stores/auth-store";

/**
 * Boolean reativo no client indicando se o usuário tem a role exigida.
 *
 * Retorna `false` enquanto a sessão ainda não foi hidratada — assim a UI
 * começa escondida por padrão e aparece quando confirmado, evitando
 * flash de conteúdo restrito.
 */
export function useHasRole(...allowed: UserRole[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return allowed.includes(user.role);
}
