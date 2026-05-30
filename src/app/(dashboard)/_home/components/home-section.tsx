import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import type { IconifyIcon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";

type HomeSectionProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  icon?: IconifyIcon;
  /** Âncora para os CTAs dos alertas (ex.: "proximas-entregas"). */
  id?: string;
  title: string;
};

/** Card de seção da Home: cabeçalho com ícone/título + slot de ação + conteúdo. */
export function HomeSection({
  action,
  children,
  className,
  icon,
  id,
  title,
}: HomeSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "border-border bg-card flex flex-col rounded-2xl border p-3 sm:p-4",
        // `scroll-mt` evita que o cabeçalho/topbar cubra a seção ao navegar por âncora.
        id ? "scroll-mt-24" : undefined,
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
          {icon ? (
            <Icon
              icon={icon}
              aria-hidden
              className="text-muted-foreground h-[18px] w-[18px]"
            />
          ) : null}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
