import { it, vi, expect, describe } from "vitest";

import { applyBackendErrors } from "@/shared/lib/errors";

describe("applyBackendErrors", () => {
  it("aplica apenas mensagens string não vazias no formulário", () => {
    const setError = vi.fn();
    const form = { setError };

    applyBackendErrors(form as never, {
      document: "Documento duplicado.",
      email: "",
      name: undefined as unknown as string,
    });

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith("document", {
      message: "Documento duplicado.",
    });
  });
});
