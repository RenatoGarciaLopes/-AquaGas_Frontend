"use client";

import { Search } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type FuncionariosToolbarProps = {
  initialSearch?: string;
};

export function FuncionariosToolbar({
  initialSearch = "",
}: FuncionariosToolbarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const queryString = searchParams.toString();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const sanitizedSearch = search.trim();

      if (sanitizedSearch === currentSearch.trim()) {
        return;
      }

      const params = new URLSearchParams(queryString);

      if (sanitizedSearch) {
        params.set("search", sanitizedSearch);
        params.set("pageNumber", "1");
      } else {
        params.delete("search");
        params.delete("pageNumber");
      }

      const nextQueryString = params.toString();

      startTransition(() => {
        router.replace(
          nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
          { scroll: false },
        );
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [currentSearch, pathname, queryString, router, search, startTransition]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10">
      <label className="block max-w-xl" htmlFor="funcionarios-search">
        <span className="text-sm font-medium text-white">
          Buscar funcionário
        </span>
        <span className="relative mt-2 block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300"
            aria-hidden
          />
          <input
            id="funcionarios-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, CPF ou email"
            className="w-full rounded-xl border border-[var(--aquagas-input-border)] bg-[var(--aquagas-input)] py-3 pr-4 pl-10 text-sm text-white transition outline-none placeholder:text-slate-300/50 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
          />
        </span>
      </label>
      <p className="mt-2 text-xs text-[var(--aquagas-muted)]">
        {isPending ? "Atualizando lista..." : "A busca atualiza a URL."}
      </p>
    </div>
  );
}
