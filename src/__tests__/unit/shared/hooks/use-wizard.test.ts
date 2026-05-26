import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useWizard } from "@/shared/hooks/use-wizard";

describe("useWizard", () => {
  it("bloqueia avanço quando trigger retorna false", async () => {
    const trigger = vi.fn(async () => false);

    const { result } = renderHook(() =>
      useWizard({
        stepFields: [["name"], ["email"], []],
        steps: 3,
        trigger,
      }),
    );

    await act(async () => {
      await expect(result.current.goNext()).resolves.toBe(false);
    });

    expect(result.current.step).toBe(0);
    expect(trigger).toHaveBeenCalledWith(["name"]);
  });

  it("avança, volta e calcula progresso", async () => {
    const trigger = vi.fn(async () => true);

    const { result } = renderHook(() =>
      useWizard({
        stepFields: [["name"], ["email"], []],
        steps: 3,
        trigger,
      }),
    );

    await act(async () => {
      await result.current.goNext();
    });

    expect(result.current.step).toBe(1);
    expect(result.current.progress).toBe(50);

    act(() => {
      result.current.goBack();
    });

    expect(result.current.step).toBe(0);
  });

  it("volta para o passo que contém erro de backend", async () => {
    const trigger = vi.fn(async () => true);

    const { result } = renderHook(() =>
      useWizard({
        stepFields: [["name"], ["email"], []],
        steps: 3,
        trigger,
      }),
    );

    await act(async () => {
      await result.current.goNext();
      await result.current.goNext();
    });

    act(() => {
      result.current.jumpToFieldError({ email: ["Já usado."] });
    });

    expect(result.current.step).toBe(1);
  });
});
