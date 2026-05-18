import { forwardRef } from "react";
import type { ReactNode, InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type FormFieldWrapperProps = {
  children: ReactNode;
  error?: string;
  hint?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
};

/**
 * Wrapper para campos custom (radios, selects). Para inputs simples use TextField.
 */
export function FormField({
  children,
  error,
  hint,
  htmlFor,
  label,
  required,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-foreground block text-sm font-medium"
      >
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  hint?: string;
  label: string;
  required?: boolean;
};

/**
 * Input com floating label: rótulo fixo no topo do campo, valor abaixo.
 * Pensado para uso com react-hook-form: aceita `{...register(name)}` via forwardRef.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { className, error, hint, id, label, required, ...inputProps },
    ref,
  ) {
    if (!id) {
      throw new Error("TextField requires an id for accessibility.");
    }
    return (
      <div className="space-y-1.5">
        <div
          className={cn(
            "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60 rounded-lg px-4 py-2.5 transition",
            error ? "ring-1 ring-red-400/70" : "",
          )}
        >
          <label
            htmlFor={id}
            className="text-muted-foreground block text-xs font-medium"
          >
            {label} {required ? <span className="text-red-500">*</span> : null}
          </label>
          <input
            {...inputProps}
            id={id}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            className={cn(
              "text-foreground placeholder:text-muted-foreground/60 mt-0.5 w-full border-0 bg-transparent text-sm shadow-none outline-none focus:ring-0 focus:outline-none",
              className,
            )}
          />
        </div>
        {hint && !error ? (
          <p className="text-muted-foreground px-1 text-xs">{hint}</p>
        ) : null}
        {error ? <p className="px-1 text-xs text-red-400">{error}</p> : null}
      </div>
    );
  },
);
