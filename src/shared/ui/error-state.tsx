import Link from "next/link";
import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

import { Icons } from "@/shared/lib/icons";

type ErrorStateProps = {
  action?: ReactNode;
  description?: string;
  retry?: () => void;
  title?: string;
};

export function ErrorState({
  action,
  description = "Tente novamente em instantes.",
  retry,
  title = "Não foi possível carregar os dados",
}: ErrorStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-red-400/15 p-3 text-red-100">
        <Icon icon={Icons.alertTriangle} className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-red-100/80">{description}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {retry ? (
          <button
            type="button"
            onClick={retry}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus:ring-2 focus:ring-white/60 focus:outline-none"
          >
            Tentar novamente
          </button>
        ) : null}
        {action}
        <Link
          href="/"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus:ring-2 focus:ring-white/40 focus:outline-none"
        >
          Ir para início
        </Link>
      </div>
    </div>
  );
}
