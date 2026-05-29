"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";

type Tab = { href: string; label: string; exact?: boolean };

const TABS: Tab[] = [
  { href: "/reports", label: "Visão geral", exact: true },
  { href: "/reports/sales", label: "Vendas" },
  { href: "/reports/stock", label: "Estoque" },
  { href: "/reports/penalties", label: "Multas" },
];

function isActive(href: string, exact: boolean, pathname: string) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function ReportsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação de relatórios"
      className="border-border bg-card flex w-full gap-1 overflow-x-auto rounded-xl border p-1 shadow-sm"
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href, tab.exact ?? false, pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition",
              active
                ? "bg-cyan-500 text-white shadow"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
