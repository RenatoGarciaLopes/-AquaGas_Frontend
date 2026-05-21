import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import type { UserRole } from "@/shared/auth/roles";
import { getCurrentUserRole } from "@/shared/auth/server";

type AuthGuardProps = {
  roles?: UserRole[];
  redirectTo?: string;
  children: ReactNode;
};

/**
 * Guard server-side para `layout.tsx` ou `page.tsx`.
 *
 * Se `roles` for fornecido, redireciona quando o usuário não tem nenhuma das
 * roles permitidas. Sem `roles`, exige apenas estar autenticado (presença de
 * uma role válida).
 */
export async function AuthGuard({
  roles,
  redirectTo = "/",
  children,
}: AuthGuardProps) {
  const role = await getCurrentUserRole();
  if (!role) redirect("/login");
  if (roles && !roles.includes(role)) redirect(redirectTo);
  return <>{children}</>;
}
