import type { ReactNode } from "react";

import { ProgressBar } from "@/shared/ui/progress-bar";
import { Stepper, type StepperStep } from "@/shared/ui/stepper";

type WizardShellProps = {
  /** Lista de passos para o Stepper lateral. */
  steps: StepperStep[];
  /** Índice (0-based) do passo atual. */
  currentStep: number;
  /** 0..100 — exibido na barra de progresso superior. */
  progress: number;
  /** Título do passo atual (h2 acima do conteúdo). */
  title: string;
  /** Conteúdo do passo: campos, seções, revisão. */
  children: ReactNode;
  /** Slot esquerdo do footer — geralmente "Cancelar" ou "Voltar". */
  back: ReactNode;
  /** Slot direito do footer — geralmente "Próximo" ou "Salvar". */
  next: ReactNode;
  /** Banner opcional acima do conteúdo (erro de request, alerta global). */
  banner?: ReactNode;
};

/**
 * Moldura padrão dos wizards de criação (`/*\/novo`).
 *
 * Layout: barra de progresso no topo + grid 2-colunas com `Stepper` sticky
 * à esquerda e conteúdo à direita. Footer com slots `back`/`next`.
 *
 * Componente puro de layout — não tem estado próprio. Use junto com o hook
 * `useWizard` (`@/shared/hooks/use-wizard`) que cuida da navegação.
 */
export function WizardShell({
  back,
  banner,
  children,
  currentStep,
  next,
  progress,
  steps,
  title,
}: WizardShellProps) {
  return (
    <div className="space-y-8">
      <ProgressBar label="Progresso" value={progress} />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Stepper currentStep={currentStep} steps={steps} />
        </aside>

        <div className="space-y-6">
          {banner}

          <header>
            <h2 className="text-foreground text-2xl font-semibold tracking-tight">
              {title}
            </h2>
          </header>

          {children}

          <footer className="border-border flex items-center justify-between border-t pt-6">
            {back}
            {next}
          </footer>
        </div>
      </div>
    </div>
  );
}
