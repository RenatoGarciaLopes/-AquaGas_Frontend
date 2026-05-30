import { cn } from "@/shared/lib/cn";

type WizardProgressProps = {
  /** Índice 0-based do passo atual. */
  currentStep: number;
  /** Total de passos. */
  totalSteps: number;
  /** Label/título do passo atual. */
  stepLabel: string;
  className?: string;
};

/**
 * Indicador de progresso compacto para wizards em mobile.
 * Mostra "Passo X de Y" + nome do passo + barra de progresso.
 *
 * Oculto em lg+ (pois o Stepper lateral assume).
 */
export function WizardProgress({
  className,
  currentStep,
  stepLabel,
  totalSteps,
}: WizardProgressProps) {
  const percent =
    totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;

  return (
    <div className={cn("space-y-2 lg:hidden", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Passo {currentStep + 1} de {totalSteps}
          </p>
          <p className="text-foreground mt-0.5 truncate text-sm font-semibold">
            {stepLabel}
          </p>
        </div>
        <span className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums">
          {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Progresso do wizard"
        className="bg-muted h-1.5 overflow-hidden rounded-full"
      >
        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
