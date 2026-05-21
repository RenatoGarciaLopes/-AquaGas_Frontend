import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUserRole, type UserRole } from "@/shared/auth/roles";

type AuthGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
};

export async function AuthGuard({
  allowedRoles,
  children,
  fallback = null,
  redirectTo,
}: AuthGuardProps) {
  const role = await getCurrentUserRole();

  if (!allowedRoles.includes(role)) {
    if (redirectTo) {
      redirect(redirectTo);
    }

    return fallback;
  }

  return <>{children}</>;
}
