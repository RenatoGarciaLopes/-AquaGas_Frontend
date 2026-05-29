import { screen } from "@testing-library/react";
import { it, expect, describe, beforeEach } from "vitest";

import { renderWithProviders } from "@/__tests__/test-utils";

import { RoleGuard } from "@/features/auth/guards/role-guard";
import { useAuthStore } from "@/features/auth/stores/auth-store";

describe("RoleGuard", () => {
  beforeEach(() => {
    useAuthStore.setState({ isInitialized: true, user: null });
  });

  it("renderiza children quando role é permitida", () => {
    useAuthStore.setState({
      isInitialized: true,
      user: { id: "1", role: "GERENTE", userName: "gerente" },
    });

    renderWithProviders(
      <RoleGuard roles={["GERENTE"]}>Ação sensível</RoleGuard>,
    );

    expect(screen.getByText("Ação sensível")).toBeInTheDocument();
  });

  it("renderiza fallback quando role não é permitida", () => {
    useAuthStore.setState({
      isInitialized: true,
      user: { id: "1", role: "FUNCIONARIO", userName: "func" },
    });

    renderWithProviders(
      <RoleGuard roles={["GERENTE"]} fallback={<span>Sem acesso</span>}>
        Ação sensível
      </RoleGuard>,
    );

    expect(screen.queryByText("Ação sensível")).not.toBeInTheDocument();
    expect(screen.getByText("Sem acesso")).toBeInTheDocument();
  });
});
