export function onlyDigits(value: string | null | undefined) {
  return value?.replace(/\D/g, "") ?? "";
}

export function formatCpfMasked(value: string | null | undefined) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return value || "-";
  return digits.replace(/(\d{3})(\d{3})(\d{3})\d{2}/, "$1.$2.$3-**");
}

export function formatCpf(value: string | null | undefined) {
  const digits = onlyDigits(value);

  if (digits.length !== 11) {
    return value || "-";
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(value: string | null | undefined) {
  const digits = onlyDigits(value);

  if (digits.length !== 14) {
    return value || "-";
  }

  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5",
  );
}

export function formatPhone(value: string | null | undefined) {
  const digits = onlyDigits(value);

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value || "-";
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Converte o valor de um `<input type="date">` ("YYYY-MM-DD") em ISO ao
 * meio-dia UTC. Backends que validam `data > UtcNow` rejeitam uma data sem hora
 * (interpretada como meia-noite UTC) em fusos negativos como UTC−3, pois a
 * meia-noite já está no passado. Meio-dia UTC garante o futuro e preserva o dia.
 */
export function dateInputToIso(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!, 12)).toISOString();
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
