"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  SESSION_EXPIRED_EVENT,
  resetSessionExpiredFlag,
} from "@/shared/api/client";

import { useAuthStore } from "@/features/auth/stores/auth-store";

/**
 * Ilha global. Ouve o evento disparado pelo interceptor axios quando o refresh
 * falha. Mostra um alerta modal e redireciona para /login?expired=1.
 */
export function SessionExpiredDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    function handler() {
      setOpen(true);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  }, []);

  if (!open) return null;

  function handleConfirm() {
    setOpen(false);
    resetSessionExpiredFlag();
    clear();
    router.push("/login?expired=1");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="border-border bg-card w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-xl">
        <h2
          id="session-expired-title"
          className="text-foreground text-lg font-semibold"
        >
          Sessão expirada
        </h2>
        <p className="text-muted-foreground text-sm">
          Sua sessão expirou por inatividade. Faça login novamente para
          continuar.
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-[#00abea] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0099d1]"
            onClick={handleConfirm}
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
}
