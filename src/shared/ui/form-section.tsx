import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/react";

type FormSectionProps = {
  title: string;
  description?: string;
  icon?: IconifyIcon;
  action?: ReactNode;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  icon,
  action,
  children,
}: FormSectionProps) {
  return (
    <section className="border-border bg-card/40 rounded-xl border p-5 sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Icon icon={icon} className="h-5 w-5" aria-hidden />
            </span>
          ) : null}
          <div>
            <h3 className="text-foreground text-sm font-semibold">{title}</h3>
            {description ? (
              <p className="text-muted-foreground mt-0.5 text-xs">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
