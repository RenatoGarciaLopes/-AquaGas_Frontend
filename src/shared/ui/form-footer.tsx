import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type FormFooterProps = {
  /** Slot esquerdo (geralmente "Cancelar" ou "Voltar"). Em mobile, fica acima do primário. */
  secondary?: ReactNode;
  /** Slot direito/primário (geralmente "Salvar" ou "Próximo"). Em mobile, fica embaixo (mais alcançável). */
  primary: ReactNode;
  className?: string;
  /** Adiciona borda superior. Padrão: true. */
  bordered?: boolean;
};

/**
 * Footer responsivo de formulário.
 *
 * Em mobile: botões empilhados, primário embaixo (mais fácil de alcançar com polegar).
 * Em sm+: botões lado a lado à direita.
 *
 * Os filhos devem usar `w-full sm:w-auto` para aproveitar o comportamento.
 */
export function FormFooter({
  bordered = true,
  className,
  primary,
  secondary,
}: FormFooterProps) {
  return (
    <footer
      className={cn(
        "flex flex-col-reverse gap-2 pt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-3",
        bordered && "border-border border-t",
        className,
      )}
    >
      {secondary}
      {primary}
    </footer>
  );
}
