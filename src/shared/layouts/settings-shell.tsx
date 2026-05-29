"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

import { Icons } from "@/shared/lib/icons";

import { VerticalTabs, type VerticalTab } from "@/shared/ui/vertical-tabs";

type MobileIndexConfig = {
  /** Quando true (em <lg): mostra a tela de índice no lugar do conteúdo. */
  showIndex: boolean;
  /** Callback acionado pelo link "← Voltar para seções" exibido em mobile. */
  onBackToIndex: () => void;
  /** Heading do índice. Padrão: "O que deseja editar?". */
  heading?: string;
  /** Descrição abaixo do heading. */
  description?: string;
};

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
  /**
   * Quando definido, ativa o modo "índice de seções" em mobile (<lg).
   * - `showIndex: true` → mostra o índice (heading + lista de seções com ícone).
   * - `showIndex: false` → mostra o conteúdo + link "← Voltar para seções".
   * Em lg+ sempre renderiza side-by-side (sem alteração).
   */
  mobileIndex?: MobileIndexConfig;
};

/**
 * Moldura padrão das telas de edição em abas (padrão settingsTabs).
 *
 * Em lg+: layout de 2 colunas com VerticalTabs sticky à esquerda + conteúdo à direita.
 * Em <lg com `mobileIndex` definido: modo índice (lista de seções como menu) → ao clicar,
 *   o consumidor atualiza estado e o shell exibe apenas o conteúdo + "voltar para seções".
 */
export function SettingsShell({
  back,
  activeTab,
  ariaLabel,
  children,
  mobileIndex,
  onTabChange,
  tabs,
}: SettingsShellProps) {
  const isIndexMode = mobileIndex?.showIndex ?? false;

  return (
    <div className="space-y-6">
      {/* `back` (ex: "Voltar para produtos") fica oculto em mobile quando o
          usuário está dentro de uma seção — nesse modo o link "Voltar para
          seções" abaixo já cobre a navegação. Em mobile no modo índice e em
          lg+, o link permanece visível. */}
      {back ? (
        <div className={mobileIndex && !isIndexMode ? "hidden lg:block" : ""}>
          {back}
        </div>
      ) : null}

      {/* Mobile índice: visível apenas em <lg quando showIndex === true */}
      {mobileIndex && isIndexMode ? (
        <div className="lg:hidden">
          <MobileSectionIndex
            tabs={tabs}
            heading={mobileIndex.heading ?? "O que deseja editar?"}
            description={mobileIndex.description}
            onSelect={onTabChange}
          />
        </div>
      ) : null}

      {/* Conteúdo mobile (com link voltar) — visível em <lg quando showIndex === false */}
      {mobileIndex && !isIndexMode ? (
        <div className="space-y-4 lg:hidden">
          <button
            type="button"
            onClick={mobileIndex.onBackToIndex}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
          >
            <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
            Voltar para seções
          </button>
          <div>{children}</div>
        </div>
      ) : null}

      {/* Layout desktop: sempre lado a lado. Em <lg fallback (sem mobileIndex), comportamento legado. */}
      <div
        className={
          mobileIndex
            ? "hidden gap-8 lg:grid lg:grid-cols-[240px_1fr]"
            : "grid gap-6 sm:gap-8 lg:grid-cols-[240px_1fr]"
        }
      >
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

type MobileSectionIndexProps = {
  tabs: VerticalTab[];
  heading: string;
  description?: string;
  onSelect: (id: string) => void;
};

function MobileSectionIndex({
  description,
  heading,
  onSelect,
  tabs,
}: MobileSectionIndexProps) {
  return (
    <section aria-label={heading} className="space-y-4">
      <header>
        <h2 className="text-foreground text-base font-semibold tracking-tight">
          {heading}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </header>

      <ul className="divide-border border-border bg-card divide-y overflow-hidden rounded-xl border">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              onClick={() => onSelect(tab.id)}
              className="hover:bg-muted/40 focus-visible:bg-muted/50 group flex w-full items-center gap-4 px-4 py-4 text-left transition focus:outline-none"
            >
              {tab.icon ? (
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Icon icon={tab.icon} className="h-5 w-5" aria-hidden />
                </span>
              ) : null}
              <span className="text-foreground flex-1 text-sm font-semibold">
                {tab.label}
              </span>
              <Icon
                icon={Icons.chevronRight}
                className="text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
