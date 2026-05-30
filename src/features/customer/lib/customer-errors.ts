import {
  type ParsedError,
  createErrorParser,
} from "@/shared/lib/create-error-parser";

type CustomerField =
  | "address.cep"
  | "address.city"
  | "address.complement"
  | "address.neighborhood"
  | "address.number"
  | "address.street"
  | "document"
  | "email"
  | "name"
  | "phone";

const FIELD_ALIASES: Record<string, CustomerField> = {
  address: "address.street",
  addressid: "address.cep",
  cep: "address.cep",
  city: "address.city",
  cnpj: "document",
  cpf: "document",
  document: "document",
  email: "email",
  name: "name",
  neighborhood: "address.neighborhood",
  number: "address.number",
  phone: "phone",
  street: "address.street",
};

const parseAny = createErrorParser<CustomerField>({
  fieldAliases: FIELD_ALIASES,
  translateMessages: true,
  defaultMessage: defaultMessageForStatus,
});

export function parseCustomerError(
  envelope: unknown,
  status: number,
): ParsedError<CustomerField> {
  const result = parseAny(envelope, status);

  // Conflito de documento (409 sem campo específico) cai no campo document.
  if (status === 409 && !result.fieldErrors.document) {
    result.fieldErrors.document = result.message;
  }

  return result;
}

function defaultMessageForStatus(status: number) {
  if (status === 409) return "Já existe um cliente com esse documento.";
  if (status === 403) return "Você não tem permissão para esta operação.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  return "Não foi possível salvar o cliente. Tente novamente.";
}
