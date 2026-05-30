import { it, expect, describe } from "vitest";

import {
  editCustomerIdentitySchema,
  editCustomerContactAddressSchema,
} from "@/features/customer/schemas/edit-customer.schema";

const VALID_CPF = "529.982.247-25";
const VALID_CNPJ = "11.444.777/0001-61";

describe("editCustomerIdentitySchema", () => {
  it("aceita PF com CPF válido", () => {
    const result = editCustomerIdentitySchema.safeParse({
      document: VALID_CPF,
      name: "Maria Silva",
      type: "PF",
    });

    expect(result.success).toBe(true);
  });

  it("aceita PJ com CNPJ válido", () => {
    const result = editCustomerIdentitySchema.safeParse({
      document: VALID_CNPJ,
      name: "Empresa Água Ltda",
      type: "PJ",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita documento que não combina com o tipo selecionado", () => {
    const result = editCustomerIdentitySchema.safeParse({
      document: VALID_CNPJ,
      name: "Maria Silva",
      type: "PF",
    });

    expect(result.success).toBe(false);
  });
});

describe("editCustomerContactAddressSchema", () => {
  it("aceita contato e endereço completo", () => {
    const result = editCustomerContactAddressSchema.safeParse({
      address: {
        cep: "12345-678",
        city: "São Paulo",
        complement: "",
        neighborhood: "Centro",
        number: "123",
        street: "Rua das Águas",
      },
      email: "cliente@example.com",
      phone: "(11) 99999-8888",
    });

    expect(result.success).toBe(true);
  });

  it("aceita contato sem endereço quando backend não retorna addressId", () => {
    const result = editCustomerContactAddressSchema.safeParse({
      email: "cliente@example.com",
      phone: "(11) 99999-8888",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita telefone, email e CEP inválidos", () => {
    const result = editCustomerContactAddressSchema.safeParse({
      address: {
        cep: "123",
        city: "São Paulo",
        complement: "",
        neighborhood: "Centro",
        number: "123",
        street: "Rua das Águas",
      },
      email: "invalid",
      phone: "123",
    });

    expect(result.success).toBe(false);
  });
});
