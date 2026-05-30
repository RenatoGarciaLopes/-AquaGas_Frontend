import Link from "next/link";
import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";

import { isGerente, type UserRole } from "@/shared/auth/roles";

import { HomeSection } from "./home-section";

type QuickAction = {
  href: string;
  icon: IconifyIcon;
  label: string;
  managerOnly?: boolean;
  /** Ação primária recebe destaque visual. */
  primary?: boolean;
};

const ACTIONS: QuickAction[] = [
  { href: "/sales/new", icon: Icons.zap, label: "Nova venda", primary: true },
  { href: "/customers/new", icon: Icons.users, label: "Novo cliente" },
  { href: "/plans/new", icon: Icons.fileText, label: "Novo plano" },
  { href: "/products", icon: Icons.package, label: "Estoque baixo" },
  {
    href: "/reports",
    icon: Icons.barChart,
    label: "Relatórios",
    managerOnly: true,
  },
  {
    href: "/reports/penalties",
    icon: Icons.billList,
    label: "Multas",
    managerOnly: true,
  },
];

type QuickActionsProps = {
  className?: string;
  role: UserRole | null;
};

export function QuickActions({ className, role }: QuickActionsProps) {
  const manager = isGerente(role);
  const actions = ACTIONS.filter((a) => !a.managerOnly || manager);

  return (
    <HomeSection title="Ações rápidas" icon={Icons.zap} className={className}>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action, index) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            style={{ animationDelay: `${index * 40}ms` }}
            className={
              action.primary
                ? "aq-animate-fade-up col-span-2 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-[transform,background-color,box-shadow] duration-200 hover:bg-cyan-600 hover:shadow-md hover:shadow-cyan-500/20 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none active:scale-[0.98]"
                : "border-border bg-background hover:bg-muted text-foreground aq-animate-fade-up flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-4 text-center text-xs font-medium transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 focus:ring-2 focus:ring-cyan-300/40 focus:outline-none active:translate-y-0 active:scale-[0.98]"
            }
          >
            <Icon
              icon={action.icon}
              aria-hidden
              className={action.primary ? "h-4 w-4" : "h-5 w-5 text-cyan-500"}
            />
            {action.label}
          </Link>
        ))}
      </div>
    </HomeSection>
  );
}
