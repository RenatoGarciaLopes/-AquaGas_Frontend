import { onlyDigits } from "@/shared/lib/formatters";

export type ViaCepAddress = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type ViaCepErrorKind = "invalid" | "not_found" | "network";

export class ViaCepError extends Error {
  readonly kind: ViaCepErrorKind;

  constructor(kind: ViaCepErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = "ViaCepError";
  }
}

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

const VIACEP_URL = "https://viacep.com.br/ws";

export async function fetchViaCepAddress(
  rawCep: string,
  signal?: AbortSignal,
): Promise<ViaCepAddress> {
  const digits = onlyDigits(rawCep);

  if (digits.length !== 8) {
    throw new ViaCepError("invalid", "CEP deve ter 8 dígitos.");
  }

  let response: Response;
  try {
    response = await fetch(`${VIACEP_URL}/${digits}/json/`, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ViaCepError(
      "network",
      "Não foi possível consultar o CEP. Verifique sua conexão.",
    );
  }

  if (!response.ok) {
    throw new ViaCepError("not_found", "CEP não encontrado.");
  }

  let body: ViaCepResponse;
  try {
    body = (await response.json()) as ViaCepResponse;
  } catch {
    throw new ViaCepError(
      "network",
      "Resposta inválida ao consultar o CEP. Tente novamente.",
    );
  }

  if (body.erro === true || body.erro === "true") {
    throw new ViaCepError("not_found", "CEP não encontrado.");
  }

  return {
    cep: digits,
    street: body.logradouro?.trim() ?? "",
    neighborhood: body.bairro?.trim() ?? "",
    city: body.localidade?.trim() ?? "",
    state: body.uf?.trim().toUpperCase() ?? "",
  };
}
