"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import type { UserRole } from "@/shared/auth/roles";
import { useUiStore } from "@/shared/store/ui-store";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

type TopbarClientProps = {
  greeting: string;
  role: UserRole;
  userName: string;
};

export function TopbarClient({ greeting, role, userName }: TopbarClientProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const clearAccessToken = useAuthStore((s) => s.clearAccessToken);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      clearAccessToken();
      router.push("/login");
    }
  }

  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          aria-label="Abrir menu de navegação"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Icon icon={Icons.menu} className="h-5 w-5" />
        </button>

        <span className="text-sm text-muted-foreground">
          {greeting},{" "}
          <span className="font-semibold text-foreground">{userName}</span> 👋
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          aria-label="Notificações"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon icon={Icons.bell} className="h-5 w-5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00abea] text-sm font-bold text-white">
              {initial}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm leading-none font-semibold text-foreground">
                {userName}
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#00abea]">
                {role}
              </p>
            </div>

            <Icon
              icon={Icons.chevronDown}
              aria-hidden
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-150",
                dropdownOpen && "rotate-180",
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {userName}
                </p>
                <p className="text-xs font-medium text-[#00abea]">{role}</p>
              </div>

              <div className="h-px bg-border" />

              <button
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                onClick={() => void handleLogout()}
              >
                <Icon icon={Icons.logOut} aria-hidden className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
