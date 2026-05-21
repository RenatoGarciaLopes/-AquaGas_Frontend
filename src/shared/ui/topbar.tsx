import { getSessionUser } from "@/shared/auth/server";

import { TopbarClient } from "./topbar-client";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export async function Topbar() {
  const { userName, role } = await getSessionUser();
  const greeting = getGreeting();

  return <TopbarClient greeting={greeting} role={role} userName={userName} />;
}
