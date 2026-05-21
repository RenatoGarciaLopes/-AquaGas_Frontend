import { cn } from "@/shared/lib/cn";

export type StepperStep = {
  label: string;
  optional?: boolean;
};

type StepperProps = {
  className?: string;
  currentStep: number;
  steps: StepperStep[];
};

type StepStatus = "complete" | "current" | "upcoming";

function statusFor(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return "complete";
  if (index === currentStep) return "current";
  return "upcoming";
}

export function Stepper({ className, currentStep, steps }: StepperProps) {
  return (
    <ol
      aria-label="Etapas do cadastro"
      className={cn("flex flex-col", className)}
    >
      {steps.map((step, index) => {
        const status = statusFor(index, currentStep);
        const isLast = index === steps.length - 1;
        const isActive = status !== "upcoming";

        return (
          <li
            key={step.label}
            aria-current={status === "current" ? "step" : undefined}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-9 left-[15px] h-[calc(100%-2.25rem)] w-px",
                  index < currentStep ? "bg-cyan-500" : "bg-border",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition",
                status === "complete" &&
                  "border-cyan-500 bg-cyan-500 text-white",
                status === "current" &&
                  "border-cyan-500 bg-cyan-500 text-white",
                status === "upcoming" &&
                  "border-border text-muted-foreground bg-background",
              )}
            >
              {index + 1}
            </span>

            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-medium transition",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
                {step.optional ? (
                  <span className="text-muted-foreground ml-2 text-xs font-normal italic">
                    (opcional)
                  </span>
                ) : null}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
