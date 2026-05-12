"use client";

import { toast } from "sonner";
import { useEffect } from "react";

import { ErrorState } from "@/shared/ui/error-state";

export function PermissionDeniedToast() {
  useEffect(() => {
    toast.error("Sem permissão");
  }, []);

  return (
    <ErrorState
      title="Sem permissão"
      description="Seu usuário não possui permissão para acessar esta lista."
    />
  );
}
