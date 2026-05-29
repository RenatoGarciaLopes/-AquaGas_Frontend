import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

import { Icons } from "@/shared/lib/icons";

type EmptyStateProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-white/15 dark:bg-white/[0.03]">
      <div className="mb-4 rounded-full bg-cyan-100 p-3 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-200">
        <Icon icon={Icons.inbox} className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-[var(--aquagas-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
