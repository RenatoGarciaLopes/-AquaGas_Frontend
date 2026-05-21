Contexto

 O frontend está em estágio inicial (~15–20% das rotas
 especificadas implementadas). O que existe foi escrito com
 cuidado (TypeScript estrito, tokens semânticos, separação
 app/features/shared), mas:

 - A infraestrutura central da arquitetura (axios client com
 interceptors, QueryProvider/TanStack Query, AuthProvider,
 refresh automático, SessionExpiredDialog) ainda não existe;
 - A camada de dados foi resolvida no curto prazo com
 filtragem/ordenação/paginação client-side dentro do Server
 Component, o que esconde a ausência de paginação no backend e
 não escala;
 - A autenticação tem três anti-padrões críticos convivendo: (a)
 papel derivado do nome de usuário no fallback, (b) page.ts +
 page.tsx simultâneos em (dashboard)/ causando comportamento
 indefinido de roteamento, (c) logout que nunca chama o backend
 (refresh tokens permanecem válidos);
 - Existem divergências de nomenclatura entre docs (funcionario,
 produto, cliente…) e código (employee, product, customer…) — o
 backend é EN, a doc é PT. Precisamos fixar uma convenção e
 segui-la.

 O objetivo deste plano: estabilizar a base arquitetural antes de
  implementar os módulos faltantes (customer, sale, plan, report)
  e o restante de employee/product. Sem isso, cada módulo novo
 replicaria erros estruturais.

 ---
 1. Visão geral da arquitetura atual

 O que está implementado

 - App Router com route groups (auth) e (dashboard), middleware,
 layout server + topbar/sidebar (ilhas).
 - Features parciais: auth (login/logout proxy + store mínima),
 employee (listagem + DELETE), product (listagem + wizard de
 criação 2 passos + DELETE).
 - Features vazias: customer, sale, plan, report (apenas pasta).
 - Shared: serverFetch para RSC, ApiError tipado, helpers de role
  (roles.ts, session.ts), formatters, masks, wizard-shell +
 use-wizard, data-table wrapper TanStack, componentes base UI
 (form-field, page-header, empty-state, error-state, stepper,
 sidebar, topbar).
 - Stack instalada: Next 14 App Router, React 18, TypeScript
 estrito, Tailwind, shadcn (new-york), Zustand (mínimo), zod
 (mínimo), TanStack Table — falta TanStack Query, axios,
 react-hook-form (?), sonner, react-imask, date-fns (validar via
 package.json antes da Etapa 1).

 O que está ausente

 - shared/api/client.ts (axios + interceptors) e
 shared/providers/query-provider.tsx.
 - Rotas app/api/auth/refresh e app/api/auth/session.
 - useSession, useLogin, useLogout, useHasRole, RoleGuard,
 AuthGuard, SessionExpiredDialog.
 - Schemas zod compartilhados (cpf, cnpj, telefone, password,
 money), validadores reais de CPF/CNPJ (algoritmo).
 - shared/types/enums.ts (UserRole, ProductType, etc.) e
 shared/constants/routes.ts.
 - SettingsLayout (nav vertical para edição) — referenciado em
 todas as telas de editar.
 - Detalhe/edição de qualquer entidade; todas as features de
 customer, sale, plan, report.

 ---
 2. Pontos positivos a preservar

 - Separação de camadas app/ → features/ → shared/ respeitada nos
  imports atuais (sem feature importando feature, sem shared
 importando feature).
 - serverFetch (src/shared/api/server-fetch.ts) já injeta o
 Bearer corretamente, parseia o envelope ApiResponse e extrai
 fieldErrors de error.details[]. É a base correta para todas as
 chamadas server-side.
 - ApiError (src/shared/api/errors.ts) é tipado com status, code,
  message, fieldErrors — alinhado ao envelope do backend.
 - roles.ts faz normalizeRole (Manager↔GERENTE,
 Employee↔FUNCIONARIO), com fallback robusto para JWT — deve ser
 a única fonte da verdade (hoje há duplicação no employee.api.ts
 e employees-table.tsx).
 - wizard-shell + use-wizard são a base correta para todos os
 wizards de criação.
 - Imports usam alias @/, sem caminhos relativos.
 - Componentes visuais puros (badges, cells, branding) são Server
  Components — Islands Architecture respeitada nos componentes
 existentes.

 ---
 3. Convenção de nomenclatura (decidir antes de executar)

 Recomendação: manter o frontend em inglês (employee, product,
 customer, sale, plan, report) — alinhado ao backend
 (/api/employees, /api/products, …) e ao que já está parcialmente
  implementado. Tratar a documentação PT como referência
 semântica, não como contrato de pastas.

 Justificativa: o backend é a fonte da verdade (controllers em
 EN, DTOs em EN). Renomear para PT exigiria também reescrever
 todas as rotas e quebraria URLs. O custo da divergência
 doc/código é menor que o custo de duplicar nomes ao longo de
 toda a stack.

 Ação: registrar a convenção em AGENTS.md e atualizar CLAUDE.md
 para refletir que a doc usa PT como rótulo de domínio, mas o
 código segue EN do backend.

 ---
 4. Problemas arquiteturais classificados

 Severidade: 🔴 Crítico · 🟠 Alto · 🟡 Médio · 🔵 Baixo

 🔴 CRÍTICOS

 C1. Conflito page.tsx + page.ts em (dashboard)/
 - Arquivos: src/app/(dashboard)/page.tsx (redirect → /employees)
  e src/app/(dashboard)/page.ts (redirect → /).
 - Problema: dois arquivos page no mesmo segmento; o Next pode
 resolver para page.ts e gerar loop de redirect infinito ao
 logar.
 - Correção: deletar src/app/(dashboard)/page.ts. Manter apenas
 page.tsx.

 C2. Role derivada do nome de usuário (roleFromLoginHint)
 - Arquivo: src/shared/auth/roles.ts:111-115, usado em
 src/app/api/auth/login/route.ts:83.
 - Problema: se extractUserRole(payload) não encontra a role no
 payload do backend, o sistema usa userName.includes("gerente")
 como fallback. Isso permite escalar privilégio inventando um
 username.
 - Correção: remover roleFromLoginHint. Se o backend não retornar
  role explícita, falhar o login (return 502 ou descartar o
 cookie de role). Idealmente parsear sempre o JWT (accessToken) —
  o backend coloca a role no claim.

 C3. Logout não invalida o refresh token no backend
 - Arquivo: src/app/api/auth/logout/route.ts:15-21.
 - Problema: apaga cookies locais mas nunca chama POST
 {API}/api/auth/logout. O refresh token continua válido no
 backend; um token roubado segue utilizável.
 - Correção: chamar o backend com o refresh cookie atual
 (encaminhar via fetch), só depois limpar cookies.

 C4. Sem axios client + interceptor 401
 - Arquivos esperados: src/shared/api/client.ts (axios com
 interceptors), src/shared/providers/query-provider.tsx.
 - Problema atual: mutations (create-product-form.tsx,
 row-actions.tsx de employee/product) usam fetch() direto. Não há
  refresh automático: quando o aquagas_access_token expirar,
 todas as mutações retornarão 401 sem tentativa de refresh.
 - Correção: criar client.ts com Bearer no request, queue de
 refresh no response 401, evento auth:session-expired quando o
 refresh falhar. Criar query-provider.tsx com staleTime: 30s,
 gcTime: 5min, retry: 1 (não em 4xx), refetchOnWindowFocus:
 false. Pluggar em app/layout.tsx.

 C5. Rota /api/auth/refresh e /api/auth/session ausentes
 - Arquivos esperados: src/app/api/auth/refresh/route.ts,
 src/app/api/auth/session/route.ts.
 - Problema: o interceptor 401 não tem para onde mandar o
 refresh; o AuthProvider (também ausente) não tem como hidratar a
  sessão no mount.
 - Correção: implementar os dois route handlers como proxy,
 atualizando o cookie httpOnly. session retorna { user, expiresAt
  } lendo o JWT do cookie de access.

 C6. Parsing frágil do Set-Cookie do backend
 - Arquivo: src/app/api/auth/login/route.ts:65-77.
 - Problema: usa setCookie.match(/refreshToken=([^;]+)/) para
 extrair manualmente. Se o backend mudar para refresh_token= ou
 enviar múltiplos Set-Cookie, o login quebra silenciosamente.
 - Correção: usar response.headers.getSetCookie() (suportado pelo
  Next/Node 18) e repassar o cookie correto para o cliente sem
 manipular string. Idealmente, deixar o navegador receber o
 cookie original do backend (mesmo domínio via proxy) ou
 re-emiti-lo com o mesmo nome esperado pelo backend no refresh.

 C7. Convivência de múltiplos nomes de cookie
 - Arquivos: src/middleware.ts:6, src/shared/auth/roles.ts:8-15
 (JWT_COOKIE_CANDIDATES), src/app/api/auth/logout/route.ts:7-13.
 - Problema: o sistema aceita aq_refresh, aq_access,
 aquagas_access_token, aquagas_refresh_token, accessToken,
 refreshToken — cada lugar com uma lista diferente. Isso esconde
 um contrato mal definido e cria zumbis (cookies antigos não
 expirados confundem o middleware).
 - Correção: fixar dois nomes canônicos (aquagas_access_token,
 aquagas_refresh_token), remover todos os fallbacks. Documentar
 em um único lugar (shared/auth/cookies.ts).

 🟠 ALTOS

 A1. Paginação/ordenação/filtros 100% client-side dentro do RSC
 - Arquivos: src/features/employee/api/employee.api.ts:55-101,
 src/features/product/api/product.api.ts:75-97.
 - Problema: o backend não suporta query params; o frontend baixa
  a lista inteira e filtra/ordena/paginar no Server Component.
 Não escala, gasta memória do servidor Next, invalida cache do
 TanStack Query.
 - Correção: dois caminhos possíveis (escolher um):
   - (a) Preferível — adicionar ?pageNumber&pageSize&search&sort
 no backend e remover toda a lógica client-side.
   - (b) Provisório — extrair a lógica para
 shared/lib/in-memory-table.ts (uma função paginateAndSort(items,
  query)) compartilhada entre employee e product, e marcar com
 TODO: remover quando backend tiver paginação. Não duplicar.

 A2. Auth store sem user
 - Arquivo: src/features/auth/stores/auth-store.ts.
 - Problema: guarda apenas accessToken. Componentes que precisam
 do nome/role na UI (ex.: topbar com nome do usuário, RoleGuard)
 leem de cookies httpOnly indiretamente via server. Não há um
 useSession() reativo.
 - Correção: store passa a guardar { accessToken, user: { id,
 userName, role } | null }. Hidratar via /api/auth/session no
 AuthProvider. Persistência não em localStorage.

 A3. Mutations sem hook nem TanStack Query
 - Arquivos:
 src/features/product/components/create-product-form.tsx:79-105,
 src/features/employee/components/row-actions.tsx:74-95,
 src/features/product/components/row-actions.tsx.
 - Problema: fazem fetch("/api/products", ...) direto, sem
 useMutation, sem invalidar cache, sem retry de 401, sem toast
 padronizado, sem optimistic update.
 - Correção: criar features/<m>/hooks/use-create-<m>.ts,
 use-update-<m>.ts, use-delete-<m>.ts. Cada hook chama a função
 do api/<m>.api.ts, invalida a queryKey do módulo, dispara
 toast.success/toast.error. As Route Handlers podem permanecer
 como proxy, mas a chamada parte do hook.

 A4. Hooks de query ausentes
 - Problema: não existe useEmployees, useProducts, useEmployee,
 useProduct. As tabelas recebem initialData mas não há nada que
 faça refetch ou paginação client-side reativa (qualquer
 interação volta no servidor via URL).
 - Correção: criar features/<m>/hooks/use-<m>s.ts (lista) e
 use-<m>.ts (detalhe) com useQuery({ initialData }). Centralizar
 queryKey em features/<m>/hooks/query-keys.ts.

 A5. Lógica de domínio duplicada entre arquivos
 - normalizeRole em três lugares:
   - src/features/employee/api/employee.api.ts:14-17
   - src/features/employee/components/employees-table.tsx:27-30
 (normalizeRoleLabel)
   - src/shared/auth/roles.ts:17-33 (canônico)
 - Correção: deletar as duas duplicatas e importar de
 @/shared/auth/roles. Se a versão da employees-table é só para
 label, criar roleToLabel(role) no mesmo arquivo de roles.ts.

 A6. Lógica de tabela (sort/filter/paginate) duplicada
 - src/features/employee/api/employee.api.ts:19-100 ≈
 src/features/product/api/product.api.ts:15-97. Parsing de
 "campo:asc", slicing, Math.min/Math.max, contagem — tudo igual.
 - Correção: extrair para shared/lib/in-memory-table.ts enquanto
 a paginação for client-side. Quando A1 for resolvido pelo
 backend, descartar.

 A7. Sidebar com nav hardcoded, sem RoleGuard
 - Arquivo: src/shared/ui/sidebar.tsx (nav items hardcoded).
 - Problema: /reports deveria aparecer só para GERENTE; nav vai
 duplicar quando customer/sale/plan chegarem.
 - Correção: extrair NAV_ITEMS para shared/constants/nav.ts com
 campo role?: UserRole. Sidebar filtra com useHasRole (ou recebe
 role do server). Adicionar entradas para todos os módulos.

 A8. errorState/emptyState/error.tsx mínimos
 - src/app/error.tsx existe mas precisa virar uma ilha ("use
 client") que use ErrorState e ofereça retry.
 - src/app/(dashboard)/employees/loading.tsx existe mas precisa
 de skeleton fiel ao layout (evitar CLS).
 - Páginas sem loading.tsx/error.tsx: products, sales, reports —
 adicionar.

 🟡 MÉDIOS

 M1. shared/types/enums.ts inexistente
 - Hoje ProductType mora em features/product/types.ts. Quando
 sale/plan precisarem do mesmo enum, replicariam.
 - Correção: criar shared/types/enums.ts com UserRole,
 ProductType ("Water"|"Gas"), StockMovementType ("Entry"|"Exit"),
  TypeDocument ("PF"|"PJ"), SaleStatus. Re-exportar de
 features/<m>/types.ts se quiser apelidar.

 M2. Schemas zod compartilhados não existem
 - Arquivos esperados em src/shared/schemas/: cpf.ts, cnpj.ts,
 telefone.ts, password.ts, money.ts.
 - Hoje a única validação CPF/telefone que existe é via máscara
 visual em shared/lib/masks.ts. Não há algoritmo de dígito
 verificador.
 - Correção: criar shared/lib/validators.ts com isValidCpf,
 isValidCnpj, isValidPhone. Criar shared/schemas/* usando esses
 validadores. passwordSchema espelhando a regra do backend (8+
 chars, maiúscula, minúscula, número, especial).

 M3. Field aliases hardcoded em product-errors.ts
 - Arquivo: src/features/product/lib/product-errors.ts:14-22 —
 mapa fixo { Quantity: "quantity", ... }.
 - Problema: se o backend mudar um campo, o erro fica órfão. O
 mesmo problema vai existir em cada módulo.
 - Correção: criar shared/lib/apply-backend-errors.ts genérico
 que recebe (form, apiError, mapping?). Cada feature passa seu
 mapping local (não inventar nomes).

 M4. Login fetch direto em vez de função da feature
 - Arquivo: src/features/auth/api/post-login.ts — fetch direto,
 não usa serverFetch nem o futuro client.ts.
 - Correção: após C4 estar pronto, mover para
 features/auth/api/auth.api.ts exportando { login, logout,
 refresh, session }.

 M5. Route Handlers app/api/products e app/api/employees 
 redundantes
 - Arquivos: src/app/api/products/route.ts,
 src/app/api/products/[id]/route.ts,
 src/app/api/employees/[id]/route.ts.
 - Problema: existem porque o front quis chamar a partir do
 browser. Mas o cookie aquagas_access_token é httpOnly: chamar
 diretamente o backend do client é impossível, e a Route Handler
 não acrescenta nada além do que serverFetch já faz — exceto para
  mutations chamadas do browser.
 - Correção: dois caminhos:
   - (a) Manter os Route Handlers apenas para mutations chamadas
 do client (POST/PATCH/DELETE). Padronizar: receber JSON,
 repassar para {API}/api/... com o Bearer extraído do cookie
 httpOnly, devolver o envelope.
   - (b) Centralizar essa lógica em shared/api/proxy.ts (ex.:
 proxyToBackend(request, "/api/products/register")) para evitar
 repetir o mesmo skeleton em cada handler.

 M6. extractUserRole sobreposto com decodeJwtPayload
 - Arquivo: src/shared/auth/roles.ts:80-101.
 - Recursivamente decodifica JWTs encontrados em
 record.accessToken. Funciona, mas mistura responsabilidades.
 Considerar separar em decodeAccessToken(token) e
 getRoleFromClaims(claims).

 M7. Wizard atual só tem 2 passos para produto, doc pede 3
 (Identificação → Preço/Estoque → Revisão)
 - Arquivo:
 src/features/product/components/create-product-form.tsx.
 - Correção: adicionar passo de Revisão obrigatório (a doc trata
 como padrão para todos os módulos).

 🔵 BAIXOS

 B1. Comentários em formato de banner ASCII (─── Helpers ───) em
 employee.api.ts, product.api.ts, server-fetch.ts. Ruído visual
 sem valor. Remover.

 B2. progress-bar.tsx e stepper.tsx separados — verificar se
 ambos são usados pelo wizard-shell; consolidar se houver
 redundância.

 B3. topbar.tsx + topbar-client.tsx — verificar se o split
 server/client está justificado; se a topbar inteira já precisa
 ser ilha, eliminar o wrapper.

 B4. AGENTS.md não trackeado — está em ?? AGENTS.md no git
 status. Decidir: commitar, gitignorar, ou mover para docs/.

 ---
 5. Auditoria de fallbacks

 Convenção: ✅ legítimo · ⚠️  suspeito · ❌ deve ser removido.

 Arquivo: src/shared/auth/roles.ts
 Linha: 111-115
 Fallback: roleFromLoginHint(userName) baseado em
   includes("gerente")
 Razão aparente: "Garantir que sempre haja uma role"
 Veredito: ❌
 Ação: Remover — vetor de escalonamento de privilégio (C2).
 ────────────────────────────────────────
 Arquivo: src/app/api/auth/login/route.ts
 Linha: 83
 Fallback: extractUserRole(payload) ??
   roleFromLoginHint(body.userName)
 Razão aparente: Idem
 Veredito: ❌
 Ação: Remover o ??; falhar se o backend não retornar role.
 ────────────────────────────────────────
 Arquivo: src/shared/auth/roles.ts
 Linha: 143
 Fallback: return "FUNCIONARIO" ao final de getCurrentUserRole
 Razão aparente: Evitar null no consumidor
 Veredito: ⚠️ 
 Ação: Substituir por null ou lançar — esconde sessão inválida.
   Forçar quem chama a tratar.
 ────────────────────────────────────────
 Arquivo: src/shared/auth/session.ts
 Linha: ~14
 Fallback: ?? "Usuário"
 Razão aparente: Label de display
 Veredito: ✅
 Ação: Manter (puramente visual).
 ────────────────────────────────────────
 Arquivo: src/middleware.ts
 Linha: 6
 Fallback: process.env.AQUAGAS_REFRESH_COOKIE_NAME ??
   "aquagas_refresh_token"
 Razão aparente: Permitir override por env
 Veredito: ✅
 Ação: Manter, mas garantir que o login route use o mesmo (hoje
   usa, mas via outra const).
 ────────────────────────────────────────
 Arquivo: src/app/api/auth/login/route.ts
 Linha: 12-13
 Fallback: Mesma const com ??
 Razão aparente: Idem
 Veredito: ✅
 Ação: Unificar com middleware via shared/auth/cookies.ts.
 ────────────────────────────────────────
 Arquivo: src/app/api/auth/login/route.ts
 Linha: 51-58
 Fallback: Try/catch ao parsear payload com { message:
   responseText } como fallback
 Razão aparente: Backend pode retornar texto puro em erro
 Veredito: ⚠️ 
 Ação: Aceitável, mas registrar log do payload não-JSON para
   debug.
 ────────────────────────────────────────
 Arquivo: src/app/api/auth/login/route.ts
 Linha: 65-66
 Fallback: setCookie.match(/refreshToken=...) sem else
 Razão aparente: Extração frágil de Set-Cookie
 Veredito: ❌
 Ação: Trocar por getSetCookie()/repropagação direta (C6).
 ────────────────────────────────────────
 Arquivo: src/app/api/auth/login/route.ts
 Linha: 75
 Fallback: expires: expiresMatch ? new Date(expiresMatch[1]) :
   undefined
 Razão aparente: Backend pode não enviar expires
 Veredito: ⚠️ 
 Ação: Logar se vier ausente; depende do contrato real do
 backend.
 ────────────────────────────────────────
 Arquivo: src/app/api/auth/login/route.ts
 Linha: 102-104
 Fallback: payloadData.expiresAt ? new Date(payloadData.expiresAt
  
   * 1000) : undefined
 Razão aparente: Backend retorna unix seconds
 Veredito: ⚠️ 
 Ação: Confirmar com backend se é ms ou s. Tipar expiresAt
   explicitamente, sem * 1000 mágico.
 ────────────────────────────────────────
 Arquivo: src/shared/api/server-fetch.ts
 Linha: 48-52
 Fallback: try { JSON.parse } catch { return text }
 Razão aparente: Backend pode responder texto
 Veredito: ✅
 Ação: Manter.
 ────────────────────────────────────────
 Arquivo: src/shared/api/server-fetch.ts
 Linha: 57
 Fallback: env.error?.message ?? env.message ?? fallback
 Razão aparente: Vários formatos de erro
 Veredito: ✅
 Ação: Manter.
 ────────────────────────────────────────
 Arquivo: src/shared/api/server-fetch.ts
 Linha: 99-110
 Fallback: try { fetch } catch { throw ApiError(503) }
 Razão aparente: TypeError de rede
 Veredito: ✅
 Ação: Manter — mapeia falha de conexão para um erro tipado.
 ────────────────────────────────────────
 Arquivo: src/features/employee/api/employee.api.ts
 Linha: 65
 Fallback: envelope.error?.message ?? "Falha ao carregar lista de
  
   funcionários."
 Razão aparente: Backend pode não trazer mensagem
 Veredito: ✅
 Ação: Manter.
 ────────────────────────────────────────
 Arquivo: src/features/employee/api/employee.api.ts
 Linha: 61
 Fallback: if (!envelope.success || envelope.data === null) throw
 Razão aparente: Validação explícita do envelope
 Veredito: ✅
 Ação: Manter — é validação real, não fallback escondido.
 ────────────────────────────────────────
 Arquivo: src/features/employee/api/employee.api.ts
 Linha: 73-80
 Fallback: query.search?.trim().toLowerCase() + filtered = search
  
   ? ... : allData
 Razão aparente: Busca opcional
 Veredito: ✅
 Ação: Manter, mas mover para shared/lib/in-memory-table.ts (A6).
 ────────────────────────────────────────
 Arquivo: src/features/employee/api/employee.api.ts
 Linha: 86-89
 Fallback: Math.max(1, Math.ceil(...)), Math.min(Math.max(1,
   pageNumber), totalPages)
 Razão aparente: Sanear querystring inválida
 Veredito: ✅
 Ação: Sanitização real de input — manter.
 ────────────────────────────────────────
 Arquivo: src/features/product/api/product.api.ts
 Linha: 47-66
 Fallback: Mesma sanitização
 Razão aparente: Idem
 Veredito: ✅
 Ação: Manter, deduplicar.
 ────────────────────────────────────────
 Arquivo: src/features/product/lib/product-errors.ts
 Linha: 14-22
 Fallback: FIELD_ALIASES hardcoded
 Razão aparente: Mapear nomes PT/EN
 Veredito: ⚠️ 
 Ação: Aceitável se o backend realmente devolve nomes em PT.
   Validar contrato; se backend já devolve EN, remover.
 ────────────────────────────────────────
 Arquivo: src/features/employee/components/row-actions.tsx
 Linha: ~84
 Fallback: if (!res.ok) throw new Error("...") sem distinguir
   status
 Razão aparente: Mensagem genérica
 Veredito: ⚠️ 
 Ação: Tratar 403/404/409 com mensagens específicas. Move para
   hook useDeleteEmployee (A3).
 ────────────────────────────────────────
 Arquivo: src/features/product/components/create-product-form.tsx
 Linha: ~103
 Fallback: .catch(() => null) ao parsear erro
 Razão aparente: Silencia erro de parse
 Veredito: ⚠️ 
 Ação: Tratar como erro 5xx genérico, não null.
 ────────────────────────────────────────
 Arquivo: src/features/auth/api/post-login.ts
 Linha: ~39
 Fallback: .catch(() => ({}))
 Razão aparente: Silencia erro de parse de JSON
 Veredito: ⚠️ 
 Ação: Mesmo tratamento — devolver mensagem genérica.
 ────────────────────────────────────────
 Arquivo: src/shared/lib/formatters.ts
 Linha: 7-8, 31
 Fallback: value || "-" para CPF/telefone vazios
 Razão aparente: Render seguro
 Veredito: ✅
 Ação: Manter — é UX, não esconde contrato.
 ────────────────────────────────────────
 Arquivo: src/shared/lib/env.ts
 Linha: ~15
 Fallback: throw new Error() se env var faltar
 Razão aparente: Configuração obrigatória
 Veredito: ✅
 Ação: Correto — não fallback, é validação.

 Resumo da auditoria:
 - ❌ Remover (4): roleFromLoginHint e seu uso, regex de
 Set-Cookie.
 - ⚠️  Investigar/ajustar (9): getCurrentUserRole default,
 conversões de expiresAt, .catch(() => null/{}) que silenciam
 erros, mensagens genéricas de delete, FIELD_ALIASES.
 - ✅ Manter (11): sanitização de querystring, formatters de
 display, fallbacks de mensagem com encadeamento, env validation.

 Princípio geral: fallback que mascara contrato (role, parse de
 cookie) → remover. Fallback que sanea input do usuário ou mapeia
  múltiplos formatos legítimos do backend → manter. Fallback que
 silencia exceção (.catch(() => null)) → trocar por tratamento
 explícito.

 ---
 6. Plano de refatoração

 Etapa 1 — Correções críticas de segurança e infraestrutura de
 auth

 Objetivo: eliminar os anti-padrões críticos e estabilizar a base
  de autenticação antes de qualquer outra refatoração.

 Arquivos:
 - Deletar: src/app/(dashboard)/page.ts.
 - Criar: src/shared/auth/cookies.ts (constantes únicas:
 ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, ROLE_COOKIE_NAME,
 USER_NAME_COOKIE).
 - Editar: src/shared/auth/roles.ts (remover roleFromLoginHint e
 o JWT_COOKIE_CANDIDATES redundante; usar apenas o canônico de
 cookies.ts; getCurrentUserRole retorna UserRole | null).
 - Editar: src/middleware.ts (importar de cookies.ts).
 - Editar: src/app/api/auth/login/route.ts (remover fallback de
 role por hint; trocar regex por response.headers.getSetCookie();
  clarificar conversão de expiresAt).
 - Editar: src/app/api/auth/logout/route.ts (chamar POST
 {API}/api/auth/logout com cookie de refresh antes de limpar).
 - Criar: src/app/api/auth/refresh/route.ts (proxy + atualizar
 cookies).
 - Criar: src/app/api/auth/session/route.ts (decodifica JWT do
 cookie de access e retorna { user, expiresAt } ou 401).

 Alterações propostas: ver lista acima; nada além de auth nesta
 etapa.

 Impacto esperado: login/logout/refresh com contrato fechado, sem
  escalada de privilégio, sem zumbi de cookie, sem loop de
 redirect.

 Riscos:
 - Mudar nome de cookie pode invalidar sessões em curso — fazer
 com o ambiente parado, ou aceitar que todos relogarem.
 - Backend pode não ter endpoint de logout funcional — verificar
 antes; se não tiver, marcar logout como TODO mas ainda assim
 remover fallback de role.

 Critérios de aceite:
 - getCurrentUserRole() retorna null quando o cookie está
 inválido (não inventa FUNCIONARIO).
 - Logar com username "gerente.teste" mas backend respondendo
 role: "Employee" → usuário entra como FUNCIONARIO.
 - Logout invalida o refresh token no backend (testar com POST
 /api/auth/refresh antes e depois).
 - Não existe mais page.ts em (dashboard)/.
 - Não existe mais regex para Set-Cookie.
 - Há um único cookies.ts referenciado por middleware, login
 route, logout route, refresh route, session route, e roles.ts.

 ---
 Etapa 2 — Infraestrutura de dados (axios client + TanStack
 Query)

 Objetivo: parar de usar fetch direto em componentes; criar a
 camada de dados padrão para o restante do projeto.

 Arquivos:
 - Criar: src/shared/api/client.ts — axios com baseURL,
 withCredentials, interceptor de request (Bearer do auth-store),
 interceptor de response (401 → chama /api/auth/refresh com
 queue; se falhar, dispara evento auth:session-expired e limpa
 store; 403 → toast permissão; 5xx → toast genérico).
 - Criar: src/shared/providers/query-provider.tsx — QueryClient
 global (staleTime: 30s, gcTime: 5min, retry: 1 salvo 4xx,
 refetchOnWindowFocus: false).
 - Criar: src/shared/providers/auth-provider.tsx — no mount,
 chama /api/auth/session e hidrata useAuthStore com {
 accessToken, user }.
 - Criar: src/features/auth/components/session-expired-dialog.tsx
  — ilha global no layout; ouve auth:session-expired →
 AlertDialog com CTA para /login?expired=1.
 - Criar: src/shared/hooks/use-has-role.ts,
 src/features/auth/guards/role-guard.tsx (client),
 src/features/auth/guards/auth-guard.tsx (server).
 - Editar: src/features/auth/stores/auth-store.ts — adicionar
 user: { id, userName, role } | null, setSession, clear.
 - Editar: src/app/layout.tsx — embrulhar com QueryProvider,
 AuthProvider, <Toaster /> (sonner), <SessionExpiredDialog />.
 - Migrar: src/features/auth/api/post-login.ts →
 src/features/auth/api/auth.api.ts com { login, logout, refresh,
 session }.

 Alterações propostas:
 - O client.ts substitui todo fetch() chamado de ilha.
 serverFetch continua sendo usado pelo RSC e Route Handlers (não
 precisa de interceptor — não tem 401 retry no servidor).
 - useAuthStore.setSession é chamado em três pontos: depois de
 login bem-sucedido, depois do refresh bem-sucedido, e no mount
 via AuthProvider.

 Impacto esperado: todas as mutations futuras passam a usar
 client.ts via hooks; refresh automático; nome do usuário e role
 disponíveis no client sem ler cookies httpOnly.

 Riscos:
 - Interceptor de queue de refresh é sutil — testar concorrência
 (várias requests com 401 ao mesmo tempo devem fazer um único
 refresh).
 - Evento auth:session-expired precisa ser disparado uma vez, não
  a cada 401 — guardar flag.

 Critérios de aceite:
 - useAuthStore().user.role retorna a role no client após login.
 - Forçar 401 (deletar manualmente o cookie de access) e fazer
 uma ação → request automaticamente refaz após refresh.
 - Forçar 401 + refresh inválido → SessionExpiredDialog abre e
 redireciona para /login?expired=1.
 - useHasRole("GERENTE") retorna boolean reativo no client.
 - Nenhum arquivo dentro de features/*/components/ usa fetch()
 direto.

 ---
 Etapa 3 — Migrar employee e product para o padrão data-fetching
 oficial

 Objetivo: ajustar as duas features existentes para o padrão
 RSC+initialData+useQuery+useMutation, eliminando duplicações.

 Arquivos:
 - Criar: src/shared/lib/in-memory-table.ts — função
 paginateAndSort<T>(items, query, { searchFields, sortFields }).
 Recebe a query (search, sort, pageNumber, pageSize) e devolve
 PaginatedResult<T>. Comentário no topo: TODO: descartar quando o
  backend tiver paginação.
 - Editar: src/features/employee/api/employee.api.ts — usar
 paginateAndSort; remover normalizeRole local (importar de
 shared/auth/roles); remover banners ASCII.
 - Editar: src/features/product/api/product.api.ts — idem.
 - Criar: src/features/employee/hooks/query-keys.ts,
 src/features/employee/hooks/use-employees.ts, use-employee.ts,
 use-create-employee.ts, use-update-employee.ts,
 use-deactivate-employee.ts.
 - Criar: equivalentes em src/features/product/hooks/.
 - Editar: src/features/employee/components/employees-table.tsx —
  consumir useEmployees({ initialData }); remover
 normalizeRoleLabel local.
 - Editar: src/features/product/components/products-table.tsx —
 consumir useProducts({ initialData }).
 - Editar:
 src/features/product/components/create-product-form.tsx — usar
 useCreateProduct() (hook) em vez de fetch.
 - Editar: src/features/employee/components/row-actions.tsx e
 src/features/product/components/row-actions.tsx — usar
 useDeactivate* hooks; remover .catch(() => null).

 Alterações propostas: ver acima. Nenhuma alteração no contrato
 com o backend.

 Impacto esperado: redução de ~80 linhas de código duplicado
 entre employee e product; mutations com invalidação automática
 de cache; toasts padronizados.

 Riscos:
 - Mudança no shape de PaginatedEmployees/PaginatedProducts se
 for unificado — manter aliases para evitar quebrar a tabela
 durante a migração.

 Critérios de aceite:
 - employee.api.ts e product.api.ts ficam abaixo de 50 linhas
 cada (só chamada + parse).
 - paginateAndSort é a única fonte de paginação client-side.
 - Deletar um employee invalida useEmployees automaticamente
 (tabela atualiza sem reload).
 - Criar um product mostra toast de sucesso e invalida lista.
 - Nenhuma referência a normalizeRole fora de
 shared/auth/roles.ts.

 ---
 Etapa 4 — Centralizar schemas, validators, enums e constantes

 Objetivo: preparar o terreno para customer/sale/plan/report sem
 que cada um reinvente CPF, CNPJ, telefone e enums.

 Arquivos:
 - Criar: src/shared/lib/validators.ts — isValidCpf, isValidCnpj,
  isValidPhone (algoritmos reais, com testes).
 - Criar: src/shared/schemas/cpf.ts, cnpj.ts, telefone.ts,
 password.ts, money.ts, pagination.ts.
 - Criar: src/shared/types/enums.ts — UserRole, ProductType,
 StockMovementType, TypeDocument, SaleStatus.
 - Criar: src/shared/constants/routes.ts — ROUTES.employees,
 ROUTES.products, etc. (frontend routes), e BACKEND_PATHS para
 endpoints.
 - Criar: src/shared/constants/nav.ts — NAV_ITEMS com role?:
 UserRole.
 - Criar: src/shared/lib/apply-backend-errors.ts — genérico,
 aceita mapping opcional.
 - Editar: src/shared/ui/sidebar.tsx — filtrar NAV_ITEMS por role
  (usando useHasRole ou prop de role).
 - Editar: src/features/product/lib/product-errors.ts — usar
 apply-backend-errors genérico; manter apenas o mapping
 específico do produto.
 - Editar: src/features/auth/schemas/login-schema.ts — usar
 passwordSchema compartilhado (se aplicável; login às vezes
 aceita senha legada — verificar).
 - Editar: src/features/product/schemas/create-product.schema.ts
 — usar moneySchema e ProductType de shared/types/enums.ts.

 Impacto esperado: customer/sale/plan/report podem ser
 implementadas sem duplicar validações; sidebar passa a esconder
 relatórios para FUNCIONARIO.

 Riscos:
 - passwordSchema no login (validação de força) pode bloquear
 contas legadas; só aplicar em criação/reset de senha, não no
 login.

 Critérios de aceite:
 - CPF inválido (com dígito verificador errado) é recusado pelos
 schemas.
 - FUNCIONARIO logado não vê o item "Relatórios" na sidebar.
 - ProductType é importado de shared/types/enums.ts em todos os
 lugares (não duplica em features/product/types.ts).
 - apply-backend-errors é o único mapeador genérico; cada feature
  só fornece seu mapping específico.

 ---
 Etapa 5 — SettingsLayout, detalhe/edição de employee e product

 Objetivo: entregar as rotas [id] e [id]/editar faltantes nas
 duas features que já existem, validando o padrão de edição antes
  de replicar.

 Arquivos:
 - Criar: src/shared/ui/settings-layout.tsx — componente conforme
  doc (nav vertical 220px, conteúdo à direita, mobile como tabs
 horizontais).
 - Criar: src/app/(dashboard)/employees/[id]/page.tsx (detalhe),
 editar/page.tsx (settings layout com 3 seções: Dados pessoais,
 Acesso, Segurança).
 - Criar: src/app/(dashboard)/products/[id]/page.tsx (detalhe),
 editar/page.tsx (3 seções: Identificação, Preço, Estoque).
 - Criar: src/features/employee/components/employee-detail.tsx,
 employee-edit-form.tsx, deactivate-employee-dialog.tsx.
 - Criar: src/features/product/components/product-detail.tsx,
 product-edit-form.tsx, estoque-adjust-dialog.tsx.
 - Criar: hooks correspondentes (useUpdateEmployee,
 useUpdateProduct, useUpdateStock).
 - Editar: create-product-form.tsx — adicionar passo 3 (Revisão)
 para alinhar com o padrão wizard.

 Impacto esperado: padrão de edição definido e validado em duas
 features antes de ser replicado em customer/plan; criação
 alinhada com a doc (3 passos com Revisão).

 Riscos:
 - SettingsLayout precisa funcionar com isDirty para o alerta de
 "alterações não salvas" — testar em ao menos duas seções.

 Critérios de aceite:
 - /employees/[id] renderiza dados + botão "Editar" + "Desativar"
  (visível só para GERENTE).
 - /employees/[id]/editar mostra nav vertical com 3 seções;
 salvar uma seção não afeta outras.
 - Trocar de seção com mudanças não salvas mostra alerta inline.
 - Ajustar estoque abre dialog → POST /api/products/{id}/stock
 (PATCH no backend) → tabela atualiza.
 - Wizard de produto tem passo de Revisão.

 ---
 Etapa 6 — Novos módulos: customer, sale (PDV), plan, report

 Objetivo: implementar as features faltantes em cima da base já
 validada.

 Cada submódulo recebe sua própria sub-etapa, executada na ordem:

 6.1 customer — wizard PF/PJ com endereços, lista, detalhe,
 settings layout com 4 abas, integração ViaCEP (opcional, só se o
  backend não cobrir). Schemas: createClienteSchema com
 superRefine para CPF vs CNPJ conforme type.

 6.2 sale / PDV — /sales/nova como ilha inteira justificada;
 carrinho-store em Zustand persistido em sessionStorage; combobox
  de produto com debounce; pdv-totalizador, pdv-desconto-input
 (RoleGuard GERENTE); confirm-venda-dialog.

 6.3 plan — wizard 3 passos; detalhe com 4 seções (Dados, Itens,
 Entregas, Ações contratuais); upgrade/downgrade/cancelar como
 rotas dedicadas com preview de multa.

 6.4 report — /reports/layout.tsx com AuthGuard
 roles={["GERENTE"]}; tabelas 100% Server Component;
 DateRangeFilter como ilha; export CSV em shared/lib/csv.ts.

 Critérios de aceite por submódulo:
 - Todas as rotas listadas na seção 4.2 do
 ARQUITETURA_FRONTEND.md existem.
 - Cada wizard tem passo de Revisão.
 - Cada edição usa SettingsLayout.
 - FUNCIONARIO não vê botões/ações restritas a GERENTE.
 - Erros 409 de duplicidade voltam para o campo correto via
 apply-backend-errors.

 Riscos: o maior é o backlog do backend. Verificar contratos no
 aquagas-docs MCP antes de cada submódulo; se o endpoint não
 existir, não inventar — abrir issue/TODO documentado.

 ---
 Etapa 7 — Limpeza, testes e polish

 Objetivo: consolidar e cobrir.

 Arquivos:
 - Adicionar loading.tsx/error.tsx em todas as rotas que não têm.
 - Adicionar metadata em todas as páginas.
 - Configurar Vitest + Testing Library + MSW; iniciar testes pela
  pirâmide (validators, schemas, formatters → forms, tables,
 guards → e2e críticos com Playwright).
 - Resolver pendências B1–B4 (banners ASCII, AGENTS.md,
 redundância topbar).
 - ANALYZE=true next build para confirmar metas de bundle por
 rota.

 Critérios de aceite:
 - npm run lint e tsc --noEmit passam sem warnings.
 - Coverage mínimo nos módulos críticos (auth, validators,
 schemas).
 - Bundle por rota dentro das metas da doc (listagens <100KB, PDV
  <250KB, etc.).

 ---
 Etapa — Revisão e remoção de fallbacks desnecessários
 (transversal)

 Distribuída ao longo das Etapas 1–3:

 Remover imediatamente (Etapa 1):
 - roleFromLoginHint (src/shared/auth/roles.ts:111-115).
 - Uso de roleFromLoginHint em
 src/app/api/auth/login/route.ts:83.
 - Regex /refreshToken=([^;]+)/ e /expires=([^;]+)/ em
 src/app/api/auth/login/route.ts:65-66.
 - Lista redundante JWT_COOKIE_CANDIDATES em
 src/shared/auth/roles.ts:8-15 (manter só os dois canônicos).

 Ajustar (Etapa 1):
 - getCurrentUserRole() retornando "FUNCIONARIO" por padrão
 (roles.ts:143) → retornar null e forçar quem chama a tratar.

 Substituir por tratamento explícito (Etapa 2 e 3):
 - .catch(() => null) em create-product-form.tsx:103 e
 app/api/products/route.ts:25.
 - .catch(() => ({})) em features/auth/api/post-login.ts:39 (e
 sucessor em auth.api.ts).
 - if (!res.ok) throw new Error("...") genérico em
 row-actions.tsx → distinguir 403/404/409.

 Investigar contrato (Etapa 4):
 - FIELD_ALIASES em product-errors.ts:14-22 — confirmar se
 backend manda mesmo nomes capitalizados (Quantity) ou
 minúsculos.
 - Conversão expiresAt * 1000 em login/route.ts:103 — confirmar
 se backend envia segundos ou milissegundos. Tipar
 explicitamente.

 Manter (legítimos):
 - Todos os fallbacks de display (|| "-" em formatters.ts).
 - Sanitização de paginação (Math.min/Math.max em
 employee/product api).
 - Encadeamento error.message ?? message ?? fallback no parser de
  erro.
 - try { fetch } catch { throw ApiError(503) } no
 server-fetch.ts.
 - JSON.parse com fallback para texto puro no server-fetch.ts.

 Critério de aceite: após Etapas 1–4, uma busca por \?\?\s*" e
 \|\|\s*" no projeto retorna apenas fallbacks marcados acima como
  ✅ legítimos.

 ---
 7. Resumo executivo

 ┌───────┬───────────────────┬──────────┬────────────────────┐
 │       │                   │  Tempo   │                    │
 │ Etapa │       Foco        │ estimado │ Bloqueador para o  │
 │       │                   │          │        quê         │
 │       │                   │ relativo │                    │
 ├───────┼───────────────────┼──────────┼────────────────────┤
 │ 1     │ Segurança e auth  │ 1        │ Tudo               │
 │       │ canônica          │          │                    │
 ├───────┼───────────────────┼──────────┼────────────────────┤
 │       │ Axios + TanStack  │          │ Mutations e        │
 │ 2     │ Query +           │ 1.5      │ refresh            │
 │       │ AuthProvider      │          │                    │
 ├───────┼───────────────────┼──────────┼────────────────────┤
 │       │ Migrar            │          │ Replicar padrão em │
 │ 3     │ employee/product  │ 1        │  novos módulos     │
 │       │ para padrão       │          │                    │
 ├───────┼───────────────────┼──────────┼────────────────────┤
 │       │ Schemas,          │          │                    │
 │ 4     │ validators,       │ 0.5      │ Customer/Sale/Plan │
 │       │ enums, constantes │          │                    │
 ├───────┼───────────────────┼──────────┼────────────────────┤
 │       │ SettingsLayout +  │          │                    │
 │ 5     │ detalhe/edição    │ 1        │ Customer/Plan      │
 │       │ employee/product  │          │                    │
 ├───────┼───────────────────┼──────────┼────────────────────┤
 │       │ Customer, Sale    │          │                    │
 │ 6     │ (PDV), Plan,      │ 4–6      │ —                  │
 │       │ Report            │          │                    │
 ├───────┼───────────────────┼──────────┼────────────────────┤
 │ 7     │ Loading, error,   │ 1        │ Produção           │
 │       │ testes, polish    │          │                    │
 └───────┴───────────────────┴──────────┴────────────────────┘

 Não iniciar a Etapa 6 antes das Etapas 1–5 estarem completas —
 replicar a base atual em quatro novos módulos custaria mais do
 que estabilizar primeiro.

 Critérios globais de verificação end-to-end

 Para validar manualmente ao final de cada etapa, no ambiente
 local:

 1. npm run dev sobe o front em http://localhost:3000.
 2. Backend rodando em AQUAGAS_API_BASE_URL (verificar
 .env.local).
 3. Fluxo mínimo: login (FUNCIONARIO e GERENTE) → listar
 employees → listar products → criar product (GERENTE) → editar
 product → ajustar estoque → desativar product → deslogar.
 4. Forçar 401: deletar manualmente o cookie aquagas_access_token
  no DevTools, fazer uma ação → request deve refazer após
 refresh.
 5. Forçar expiração de refresh: deletar aquagas_refresh_token
 Critérios globais de verificação end-to-end

 Para validar manualmente ao final de cada etapa, no ambiente
 local:

 1. npm run dev sobe o front em http://localhost:3000.
 2. Backend rodando em AQUAGAS_API_BASE_URL (verificar
 .env.local).
 3. Fluxo mínimo: login (FUNCIONARIO e GERENTE) → listar
 employees → listar products → criar product (GERENTE) → editar
 product → ajustar estoque → desativar product → deslogar.
 4. Forçar 401: deletar manualmente o cookie aquagas_access_token
  no DevTools, fazer uma ação → request deve refazer após
 refresh.
 5. Forçar expiração de refresh: deletar aquagas_refresh_token
 também → SessionExpiredDialog abre.
 6. Logar como FUNCIONARIO → "Relatórios" não aparece na sidebar,
  botão "Novo produto" não aparece, ação "Desativar" não aparece.

 Sem testes E2E automáticos ainda, esse roteiro manual é o gate
 antes de cada deploy.