/**
 * Nomes canônicos dos cookies de autenticação.
 * Única fonte da verdade — não duplicar em outros arquivos.
 *
 * - access: JWT curto, usado como Bearer ao chamar o backend via serverFetch.
 * - refresh: token longo, usado para renovar o access; nunca trafega para o
 *   browser fora de Route Handlers.
 * - role: cópia da role do usuário lida pelo middleware e por Server
 *   Components sem precisar decodificar JWT.
 * - userName: display name para a topbar.
 */
export const ACCESS_COOKIE_NAME = "aquagas_access_token";
export const REFRESH_COOKIE_NAME = "aquagas_refresh_token";
export const ROLE_COOKIE_NAME = "aquagas_user_role";
export const USER_NAME_COOKIE = "aquagas_user_name";

export const AUTH_COOKIE_NAMES = [
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ROLE_COOKIE_NAME,
  USER_NAME_COOKIE,
] as const;
