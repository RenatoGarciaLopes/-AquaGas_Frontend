"use client";

import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import { Icons } from "@/shared/lib/icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch — render a size-matching placeholder until mounted
  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#00abea] dark:text-slate-400 dark:hover:bg-white/10"
    >
      <Icon
        icon={isDark ? Icons.sun : Icons.moon}
        aria-hidden
        className="h-5 w-5"
      />
    </button>
  );
}
