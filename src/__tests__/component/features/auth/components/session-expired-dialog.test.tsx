import { it, vi, expect, describe, beforeEach } from "vitest";
import { act, screen, fireEvent } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { SESSION_EXPIRED_EVENT } from "@/shared/api/client";
import { renderWithProviders } from "@/__tests__/test-utils";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { SessionExpiredDialog } from "@/features/auth/components/session-expired-dialog";

describe("SessionExpiredDialog", () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAuthStore.setState({
      isInitialized: true,
      user: { id: "u1", role: "GERENTE", userName: "gerente" },
    });
  });

  it("abre com evento global, limpa sessão e redireciona", () => {
    renderWithProviders(<SessionExpiredDialog />);

    act(() => {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    });

    expect(screen.getByRole("dialog")).toHaveTextContent(/sessão expirada/i);

    fireEvent.click(screen.getByRole("button", { name: /fazer login/i }));

    expect(useAuthStore.getState().user).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/login?expired=1");
  });
});
