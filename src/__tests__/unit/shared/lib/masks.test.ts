import { it, expect, describe } from "vitest";

import {
  maskCep,
  maskCpf,
  maskCnpj,
  maskPhone,
  maskCustomerDocument,
} from "@/shared/lib/masks";

describe("maskCpf", () => {
  it("formata 11 dígitos no padrão XXX.XXX.XXX-XX", () => {
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
  });

  it("tronca em 11 dígitos quando o input é maior", () => {
    expect(maskCpf("52998224725999")).toBe("529.982.247-25");
  });

  it("formata parcialmente quando o input é menor", () => {
    expect(maskCpf("529")).toBe("529");
    expect(maskCpf("529982")).toBe("529.982");
    expect(maskCpf("529982247")).toBe("529.982.247");
  });

  it("ignora caracteres não numéricos", () => {
    expect(maskCpf("529.982.247-25")).toBe("529.982.247-25");
  });
});

describe("maskCnpj", () => {
  it("formata 14 dígitos no padrão XX.XXX.XXX/XXXX-XX", () => {
    expect(maskCnpj("11444777000161")).toBe("11.444.777/0001-61");
  });

  it("tronca em 14 dígitos quando o input é maior", () => {
    expect(maskCnpj("11444777000161999")).toBe("11.444.777/0001-61");
  });

  it("formata parcialmente quando o input é menor", () => {
    expect(maskCnpj("11444777")).toBe("11.444.777");
  });
});

describe("maskCustomerDocument", () => {
  it("aplica máscara de CPF quando type é PF", () => {
    expect(maskCustomerDocument("52998224725", "PF")).toBe("529.982.247-25");
  });

  it("aplica máscara de CNPJ quando type é PJ", () => {
    expect(maskCustomerDocument("11444777000161", "PJ")).toBe(
      "11.444.777/0001-61",
    );
  });

  it("fallback para CPF quando type é undefined", () => {
    expect(maskCustomerDocument("52998224725", undefined)).toBe(
      "529.982.247-25",
    );
  });
});

describe("maskPhone", () => {
  it("formata 10 dígitos no padrão fixo (XX) XXXX-XXXX", () => {
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("formata 11 dígitos no padrão celular (XX) XXXXX-XXXX", () => {
    expect(maskPhone("11999998888")).toBe("(11) 99999-8888");
  });

  it("tronca em 11 dígitos", () => {
    expect(maskPhone("119999988889999")).toBe("(11) 99999-8888");
  });

  it("formata parcialmente quando o input é menor", () => {
    expect(maskPhone("11")).toBe("(11");
    expect(maskPhone("1199")).toBe("(11) 99");
  });
});

describe("maskCep", () => {
  it("formata 8 dígitos no padrão XXXXX-XXX", () => {
    expect(maskCep("12345678")).toBe("12345-678");
  });

  it("tronca em 8 dígitos", () => {
    expect(maskCep("123456789999")).toBe("12345-678");
  });

  it("formata parcialmente quando menor", () => {
    expect(maskCep("12345")).toBe("12345");
    expect(maskCep("123456")).toBe("12345-6");
  });
});
