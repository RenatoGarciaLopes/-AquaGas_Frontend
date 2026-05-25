import type { IconifyIcon } from "@iconify/react";
import solarData from "@iconify-json/solar/icons.json";

// Pre-loads icon SVG bodies from the bundled Solar JSON.
// Works in server components, client components, and SSR — zero API calls.
function get(name: string): IconifyIcon {
  const record = solarData.icons as Record<string, { body: string }>;
  const icon = record[name];
  if (!icon) throw new Error(`Solar icon not found: ${name}`);
  return { body: icon.body, width: 24, height: 24 };
}

// ─── Sidebar icons — bold-duotone ────────────────────────────────────────────

export const SidebarIcons = {
  barChart: get("chart-2-bold-duotone"),
  droplets: get("waterdrop-bold-duotone"),
  fileText: get("file-text-bold-duotone"),
  layoutDashboard: get("widget-2-bold-duotone"),
  package: get("box-bold-duotone"),
  shoppingCart: get("cart-large-2-bold-duotone"),
  userCog: get("user-id-bold-duotone"),
  users: get("users-group-rounded-bold-duotone"),
  x: get("close-circle-bold-duotone"),
  zap: get("lightning-bold-duotone"),
} as const;

// ─── App icons — line-duotone ─────────────────────────────────────────────────

export const Icons = {
  alertTriangle: get("danger-triangle-line-duotone"),
  check: get("check-circle-line-duotone"),
  arrowDown: get("alt-arrow-down-line-duotone"),
  arrowUp: get("alt-arrow-up-line-duotone"),
  arrowUpDown: get("round-sort-vertical-line-duotone"),
  barChart: get("chart-2-line-duotone"),
  bell: get("bell-line-duotone"),
  chevronDown: get("alt-arrow-down-line-duotone"),
  chevronLeft: get("alt-arrow-left-line-duotone"),
  chevronRight: get("alt-arrow-right-line-duotone"),
  droplets: get("waterdrop-line-duotone"),
  eye: get("eye-line-duotone"),
  edit: get("pen-2-line-duotone"),
  trash: get("trash-bin-minimalistic-line-duotone"),
  eyeOff: get("eye-closed-line-duotone"),
  fileText: get("file-text-line-duotone"),
  flame: get("fire-line-duotone"),
  inbox: get("inbox-line-duotone"),
  layoutDashboard: get("widget-2-line-duotone"),
  logIn: get("login-2-line-duotone"),
  moon: get("moon-stars-line-duotone"),
  sun: get("sun-2-line-duotone"),
  logOut: get("logout-2-line-duotone"),
  mapPoint: get("map-point-line-duotone"),
  menu: get("hamburger-menu-line-duotone"),
  moreHorizontal: get("menu-dots-line-duotone"),
  package: get("box-line-duotone"),
  phone: get("phone-line-duotone"),
  plus: get("add-circle-line-duotone"),
  refresh: get("refresh-line-duotone"),
  search: get("magnifer-line-duotone"),
  shoppingCart: get("cart-large-2-line-duotone"),
  userCog: get("user-id-line-duotone"),
  users: get("users-group-rounded-line-duotone"),
  x: get("close-circle-line-duotone"),
  zap: get("lightning-line-duotone"),
} as const;
