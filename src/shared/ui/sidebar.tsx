"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import type { IconifyIcon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";
import { SidebarIcons } from "@/shared/lib/icons";

import { useUiStore } from "@/shared/store/ui-store";

type NavItem = {
  exact?: boolean;
  highlight?: boolean;
  href: string;
  icon: IconifyIcon;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    exact: true,
    href: "/",
    icon: SidebarIcons.layoutDashboard,
    label: "Visão geral",
  },
  { href: "/sales", icon: SidebarIcons.shoppingCart, label: "Vendas" },
  {
    exact: true,
    highlight: true,
    href: "/sales/new",
    icon: SidebarIcons.zap,
    label: "Nova Venda",
  },
  { href: "/customers", icon: SidebarIcons.users, label: "Clientes" },
  { href: "/plans", icon: SidebarIcons.fileText, label: "Planos" },
  { href: "/products", icon: SidebarIcons.package, label: "Produtos" },
  { href: "/employees", icon: SidebarIcons.userCog, label: "Funcionários" },
  { href: "/reports", icon: SidebarIcons.barChart, label: "Relatórios" },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#0b1e38]">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00abea]">
            <Icon
              icon={SidebarIcons.droplets}
              aria-hidden
              className="h-4 w-4 text-white"
            />
          </div>
          <div>
            <p className="text-sm leading-none font-bold text-white">AquaGás</p>
            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-[#8caad1] uppercase">
              Distribuidora
            </p>
          </div>
        </div>

        {onClose && (
          <button
            aria-label="Fechar menu"
            className="rounded-lg p-1 text-[#8caad1] hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <Icon icon={SidebarIcons.x} className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                item.highlight
                  ? "bg-[#00abea]/[0.12] text-[#00abea] hover:bg-[#00abea]/20"
                  : active
                    ? "bg-white/10 text-white"
                    : "text-[#8caad1] hover:bg-white/[0.06] hover:text-white",
              )}
              href={item.href}
              onClick={onClose}
            >
              <Icon
                icon={item.icon}
                aria-hidden
                className="h-[18px] w-[18px] shrink-0"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="px-6 py-4 text-[10px] text-[#8caad1]/50">
        v2.0 · AquaGás © 2025
      </p>
    </div>
  );
}

export function Sidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/[0.06] md:flex md:flex-col">
        <SidebarContent />
      </aside>

      {/* Overlay: fade in/out. `pointer-events-none` quando fechado para não
          bloquear cliques sob a área. */}
      <div
        aria-hidden
        onClick={() => setMobileSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ease-out md:hidden",
          mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer: slide-in/out a partir da esquerda. */}
      <aside
        aria-hidden={!mobileSidebarOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform shadow-xl transition-transform duration-300 ease-out md:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
      </aside>
    </>
  );
}
