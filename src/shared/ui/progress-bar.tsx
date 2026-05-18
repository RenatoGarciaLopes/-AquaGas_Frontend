import { cn } from "@/shared/lib/cn";

type ProgressBarProps = {
  className?: string;
  label?: string;
  value: number;
};

export function ProgressBar({ className, label, value }: ProgressBarProps) {
  const safe = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn("space-y-3", className)}>
      {label ? (
        <p className="text-muted-foreground text-sm">
          {label}: <span className="font-semibold text-cyan-500">{safe}%</span>
        </p>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
        className="bg-muted relative h-1 w-full rounded-full"
      >
        <span
          className="absolute top-0 left-0 h-full rounded-full bg-cyan-500 transition-all"
          style={{ width: `${safe}%` }}
        />
        <span
          aria-hidden
          className="bg-background absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-500"
          style={{ left: `${safe}%` }}
        />
      </div>
    </div>
  );
}
