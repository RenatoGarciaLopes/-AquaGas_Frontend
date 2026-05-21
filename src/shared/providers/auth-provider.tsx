"use client";

import { useEffect, type ReactNode } from "react";

import {
  useAuthStore,
  type SessionUser,
} from "@/features/auth/stores/auth-store";

type SessionResponse = {
  user: SessionUser;
  expiresAt: number | null;
};

/**
 * Hidrata `useAuthStore` no mount, lendo `/api/auth/session`.
 *
 * Funciona apenas no client; o middleware do Next já redirecionou para
 * /login se não houver cookie de refresh, então este componente só roda
 * em rotas autenticadas (ou não roda — em /login, o store fica vazio).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitialized = useAuthStore((s) => s.setInitialized);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });
        if (!response.ok) {
          if (!cancelled) setInitialized();
          return;
        }
        const data = (await response.json()) as SessionResponse;
        if (!cancelled) setSession(data.user);
      } catch {
        if (!cancelled) setInitialized();
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [setSession, setInitialized]);

  return <>{children}</>;
}
