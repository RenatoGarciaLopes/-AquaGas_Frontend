// Períodos do dashboard do Gestor. Vivem na URL (?period=...) para manter a
// tela server-rendered e linkável — alternar período revalida o RSC.

export type HomePeriod = "today" | "7d" | "month";

export const HOME_PERIODS: { label: string; value: HomePeriod }[] = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "Mês", value: "month" },
];

export function parseHomePeriod(value: string | undefined): HomePeriod {
  if (value === "today" || value === "7d" || value === "month") return value;
  return "month";
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Converte o período em intervalo `{ start, end }` (yyyy-MM-dd, hora local). */
export function periodToRange(
  period: HomePeriod,
  now: Date = new Date(),
): { start: string; end: string } {
  const end = isoDate(now);

  if (period === "today") {
    return { start: end, end };
  }

  if (period === "7d") {
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    return { start: isoDate(from), end };
  }

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: isoDate(firstOfMonth), end };
}
