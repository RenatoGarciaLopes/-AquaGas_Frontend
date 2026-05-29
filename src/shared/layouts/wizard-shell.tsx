import type { ReactNode } from "react";

import { ProgressBar } from "@/shared/ui/progress-bar";
import { WizardProgress } from "@/shared/ui/wizard-progress";
import { Stepper, type StepperStep } from "@/shared/ui/stepper";

type WizardShellProps = {
  /** Lista de passos para o Stepper lateral. */
  steps: StepperStep[];
  /** Índice (0-based) do passo atual. */
  currentStep: number;
  /** 0..100 — exibido na barra de progresso superior (desktop). */
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
 * Em lg+: barra de progresso superior + grid 2 colunas (Stepper sticky + conteúdo) + footer inline.
 * Em <lg: indicador compacto WizardProgress + conteúdo single-column + footer empilhado (primário embaixo).
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
  const currentStepLabel = steps[currentStep]?.label ?? title;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="hidden lg:block">
        <ProgressBar label="Progresso" value={progress} />
      </div>
      <WizardProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        stepLabel={currentStepLabel}
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
          <Stepper currentStep={currentStep} steps={steps} />
        </aside>

        <div className="space-y-6">
          {banner}

          <header>
            <h2 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h2>
          </header>

          {children}

          <footer className="border-border flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="sm:flex-1">{back}</div>
            <div className="sm:flex-shrink-0">{next}</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
