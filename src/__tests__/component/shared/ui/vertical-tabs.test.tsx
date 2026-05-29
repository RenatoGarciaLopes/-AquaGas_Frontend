import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { VerticalTabs } from "@/shared/ui/vertical-tabs";
import { renderWithProviders } from "@/__tests__/test-utils";

describe("VerticalTabs", () => {
  it("marca aba ativa e chama onChange", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <VerticalTabs
        activeTab="identity"
        onChange={onChange}
        tabs={[
          { id: "identity", label: "Identificação" },
          { id: "contact", label: "Contato" },
        ]}
      />,
    );

    expect(screen.getByRole("tab", { name: "Identificação" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Contato" }));

    expect(onChange).toHaveBeenCalledWith("contact");
  });
});
