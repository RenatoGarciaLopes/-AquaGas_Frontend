"use client";

import type { ReactNode } from "react";

import { VerticalTabs, type VerticalTab } from "@/shared/ui/vertical-tabs";

type SettingsShellProps = {
  /** Slot opcional no topo — geralmente um link "Voltar". */
  back?: ReactNode;
  /** Aba atualmente ativa (id). */
  activeTab: string;
  /** Lista de abas exibidas na nav vertical. */
  tabs: VerticalTab[];
  /** Callback disparado ao clicar em outra aba. */
  onTabChange: (id: string) => void;
  /** Conteúdo da aba ativa. */
  children: ReactNode;
  /** Label acessível do tablist. */
  ariaLabel?: string;
};

/**
 * Moldura padrão das telas de edição em abas (padrão settingsTabs).
 *
 * Layout: slot opcional `back` no topo + grid 2-colunas com `VerticalTabs`
 * sticky à esquerda e conteúdo à direita.
 *
 * Componente puro de layout — não tem estado próprio. O consumidor controla
 * `activeTab` + `onTabChange` e renderiza o conteúdo da aba ativa via `children`.
 *
 * Para confirmar alterações não salvas ao trocar de aba, use junto com
 * `ConfirmDialog` (`@/shared/ui/confirm-dialog`).
 */
export function SettingsShell({
  back,
  activeTab,
  ariaLabel,
  children,
  onTabChange,
  tabs,
}: SettingsShellProps) {
  return (
    <div className="space-y-6">
      {back}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <VerticalTabs
            ariaLabel={ariaLabel}
            tabs={tabs}
            activeTab={activeTab}
            onChange={onTabChange}
          />
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
