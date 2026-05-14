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
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-cyan-400/10 p-3 text-cyan-200">
        <Icon icon={Icons.inbox} className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--aquagas-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
