"use client";

import { create } from "zustand";

import type { UserRole } from "@/shared/auth/roles";

export type SessionUser = {
  id: string | null;
  userName: string;
  role: UserRole;
};

type AuthState = {
  /**
   * Usuário hidratado a partir do JWT (via GET /api/auth/session no mount).
   * `null` = não autenticado ou ainda não inicializado.
   */
  user: SessionUser | null;
  /**
   * `true` depois que o AuthProvider terminou de tentar hidratar a sessão.
   * Permite distinguir "ainda carregando" de "definitivamente sem sessão".
   */
  isInitialized: boolean;
  setSession: (user: SessionUser) => void;
  setInitialized: () => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setSession: (user) => set({ user, isInitialized: true }),
  setInitialized: () => set({ isInitialized: true }),
  clear: () => set({ user: null, isInitialized: true }),
}));
