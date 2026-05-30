import { it, expect, describe } from "vitest";

import {
  createCustomerSchema,
  type CreateCustomerSchema,
} from "@/features/customer/schemas/create-customer.schema";

const VALID_CPF = "529.982.247-25";
const VALID_CNPJ = "11.444.777/0001-61";

function basePF(
  overrides: Partial<CreateCustomerSchema> = {},
): CreateCustomerSchema {
  return {
    address: {
      cep: "12345-678",
      city: "São Paulo",
      complement: "",
      neighborhood: "Centro",
      number: "123",
      street: "Rua das Águas",
    },
    document: VALID_CPF,
    email: "cliente@example.com",
    name: "Maria Silva",
    phone: "(11) 99999-8888",
    type: "PF",
    ...overrides,
  };
}

function pathOf(error: { path: (string | number)[] }) {
  return error.path.join(".");
}

describe("createCustomerSchema", () => {
  describe("caso feliz", () => {
    it("aceita PF com CPF válido e endereço completo", () => {
      const result = createCustomerSchema.safeParse(basePF());
      expect(result.success).toBe(true);
    });

    it("aceita PJ com CNPJ válido", () => {
      const result = createCustomerSchema.safeParse(
        basePF({ document: VALID_CNPJ, type: "PJ" }),
      );
      expect(result.success).toBe(true);
    });

    it("aceita complement vazio (campo opcional)", () => {
      const result = createCustomerSchema.safeParse(
        basePF({
          address: { ...basePF().address, complement: "" },
        }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe("document — refine cruzado PF/PJ", () => {
    it("rejeita PF com CNPJ no campo document", () => {
      const result = createCustomerSchema.safeParse(
        basePF({ document: VALID_CNPJ, type: "PF" }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const docError = result.error.issues.find(
          (issue) => pathOf(issue) === "document",
        );
        expect(docError?.message).toBe("CPF inválido.");
      }
    });

    it("rejeita PJ com CPF no campo document", () => {
      const result = createCustomerSchema.safeParse(
        basePF({ document: VALID_CPF, type: "PJ" }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const docError = result.error.issues.find(
          (issue) => pathOf(issue) === "document",
        );
        expect(docError?.message).toBe("CNPJ inválido.");
      }
    });

    it("rejeita PF com CPF de DV incorreto", () => {
      const result = createCustomerSchema.safeParse(
        basePF({ document: "111.222.333-44" }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe("campos obrigatórios", () => {
    it("rejeita name vazio", () => {
      const result = createCustomerSchema.safeParse(basePF({ name: "" }));
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => pathOf(issue) === "name"),
        ).toBe(true);
      }
    });

    it("rejeita email malformado", () => {
      const result = createCustomerSchema.safeParse(
        basePF({ email: "nao-eh-email" }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => pathOf(issue) === "email"),
        ).toBe(true);
      }
    });

    it("rejeita phone com 9 dígitos", () => {
      const result = createCustomerSchema.safeParse(
        basePF({ phone: "123456789" }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const phoneError = result.error.issues.find(
          (issue) => pathOf(issue) === "phone",
        );
        expect(phoneError?.message).toBe("Telefone deve ter 10 ou 11 dígitos.");
      }
    });

    it("rejeita cep fora do formato", () => {
      const result = createCustomerSchema.safeParse(
        basePF({
          address: { ...basePF().address, cep: "123" },
        }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => pathOf(issue) === "address.cep"),
        ).toBe(true);
      }
    });

    it.each([
      ["address.street", { street: "" }],
      ["address.number", { number: "" }],
      ["address.neighborhood", { neighborhood: "" }],
      ["address.city", { city: "" }],
    ] as const)("rejeita %s vazio", (path, addressOverride) => {
      const base = basePF();
      const result = createCustomerSchema.safeParse({
        ...base,
        address: { ...base.address, ...addressOverride },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => pathOf(issue) === path),
        ).toBe(true);
      }
    });
  });
});
