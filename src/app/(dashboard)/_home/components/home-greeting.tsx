import Link from "next/link";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";

import type { UserRole } from "@/shared/auth/roles";

import type { HomeIndicators } from "../types";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** Frase de resumo do dia montada a partir dos indicadores operacionais. */
function summarize(i: HomeIndicators): string {
  const parts: string[] = [];
  if (i.deliveriesToday > 0) parts.push(`${i.deliveriesToday} entrega(s) hoje`);
  if (i.deliveriesOverdue > 0) parts.push(`${i.deliveriesOverdue} atrasada(s)`);
  if (i.receivablesPending > 0)
    parts.push(`${i.receivablesPending} recebível(is) a confirmar`);

  if (parts.length === 0) return "Nenhuma pendência operacional para hoje.";
  return `${parts.join(" · ")}.`;
}

type HomeGreetingProps = {
  indicators: HomeIndicators;
  now: Date;
  role: UserRole | null;
  userName: string;
};

export function HomeGreeting({ indicators, now, userName }: HomeGreetingProps) {
  const greeting = greetingForHour(now.getHours());
  const firstName = userName.split(" ")[0] ?? userName;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting}, {firstName}.
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {summarize(indicators)}
        </p>
      </div>

      <Link
        href="/sales/new"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
      >
        <Icon icon={Icons.zap} aria-hidden className="h-4 w-4" />
        Nova venda
      </Link>
    </header>
  );
}
