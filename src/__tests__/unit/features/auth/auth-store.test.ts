import { it, expect, describe, beforeEach } from "vitest";

import { useAuthStore } from "@/features/auth/stores/auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ isInitialized: false, user: null });
  });

  it("hidrata, inicializa e limpa sessão sem persistir token", () => {
    const user = { id: "u1", role: "GERENTE" as const, userName: "gerente" };

    useAuthStore.getState().setSession(user);
    expect(useAuthStore.getState()).toMatchObject({
      isInitialized: true,
      user,
    });

    useAuthStore.getState().clear();
    expect(useAuthStore.getState()).toMatchObject({
      isInitialized: true,
      user: null,
    });
  });

  it("marca inicialização mesmo sem usuário", () => {
    useAuthStore.getState().setInitialized();
    expect(useAuthStore.getState().isInitialized).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
