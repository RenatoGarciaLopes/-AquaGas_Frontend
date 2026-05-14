import { cookies } from "next/headers";

import { type UserRole, getCurrentUserRole } from "./roles";

export const USER_NAME_COOKIE = "aquagas_user_name";

export type SessionUser = {
  userName: string;
  role: UserRole;
};

export async function getSessionUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const userName = cookieStore.get(USER_NAME_COOKIE)?.value ?? "Usuário";
  const role = await getCurrentUserRole();
  return { userName, role };
}
