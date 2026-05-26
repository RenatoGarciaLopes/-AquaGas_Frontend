import { beforeEach, describe, expect, it } from "vitest";

import { useUiStore } from "@/shared/store/ui-store";

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ mobileSidebarOpen: false });
  });

  it("controla abertura da sidebar mobile", () => {
    expect(useUiStore.getState().mobileSidebarOpen).toBe(false);

    useUiStore.getState().setMobileSidebarOpen(true);
    expect(useUiStore.getState().mobileSidebarOpen).toBe(true);

    useUiStore.getState().setMobileSidebarOpen(false);
    expect(useUiStore.getState().mobileSidebarOpen).toBe(false);
  });
});
