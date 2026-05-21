# CLAUDE.md — AquaGás Frontend

Guia operacional para sessões de desenvolvimento com IA. Leia este arquivo inteiro antes de implementar qualquer feature.

---

## 1. Contexto do Projeto

**AquaGás Distribuidora** é um sistema de gestão para uma empresa distribuidora de água e gás. Gerencia funcionários, clientes (PF e PJ), produtos, vendas avulsas e planos de assinatura (com entregas periódicas).

Dois perfis de usuário:
- **FUNCIONARIO** — acesso geral, sem operações sensíveis
- **GERENTE** — acesso total, incluindo registro de funcionários, descontos, cancelamentos e relatórios

---

## 2. Objetivo do Frontend

Interface web para operação diária da distribuidora: login, gestão de funcionários/clientes/produtos, PDV (ponto de venda), gestão de planos e relatórios.

Responsabilidades exclusivas do frontend:
- Apresentação e interação com o usuário
- Proxy de autenticação via Route Handlers (cookies httpOnly)
- Validação de formulários no cliente (zod + react-hook-form)
- Controle de acesso visual baseado em role (GERENTE vs FUNCIONARIO)

O backend é a autoridade final em todas as regras de negócio e autorização.

---

## 3. Fontes de Verdade

**Prioridade decrescente:**

1. **Código do backend** (`/Users/renatolopes/Desktop/C/backend/AquaGas_Backend/src`) — contratos de API reais
2. **MCP `aquagas-docs`** — consultar antes de implementar qualquer feature
3. **`ARQUITETURA_FRONTEND.md`** — padrões e estrutura do frontend
4. **`ARQUITETURA_TECNICA.md`** — domínio e regras de negócio gerais
5. **Código frontend existente** — padrões já estabelecidos neste projeto

Quando houver divergência entre documentação e backend implementado, o backend tem precedência. Registrar a divergência em comentário no código ou abrir issue.

---

## 4. Arquitetura Frontend

### Stack obrigatória

| Tecnologia | Uso |
|---|---|
| Next.js 14+ (App Router) | Framework, SSR, Route Handlers |
| React 18 + TypeScript strict | UI, tipagem |
| TanStack Query 5.x | Estado de servidor, cache, mutations |
| Zustand | Estado de cliente (auth token, UI state, carrinho PDV) |
| react-hook-form + zod | Formulários e validação |
| axios | HTTP client com interceptors (cliente) |
| shadcn/ui + Tailwind CSS | Componentes UI |
| sonner | Toasts |
| date-fns | Formatação de datas |

### Paradigma: Islands Architecture

- **Padrão**: Server Components. HTML renderizado no servidor, zero JS para partes estáticas.
- **Ilhas (`"use client"`)**: apenas quando há `onClick`, `useState`, `useEffect`, Browser APIs ou libs client-only.
- **Nunca**: marcar `layout.tsx` inteiro como `"use client"`, usar `"use client"` em componentes puramente visuais (badges, cards, headings).

### Camadas e fluxo de dependências

```
app/ → features/<modulo>/ → shared/
```

- `app/` — rotas, layouts, middleware, Route Handlers
- `features/<modulo>/` — UI, hooks, schemas, API functions, types do módulo
- `shared/` — HTTP client, componentes base, utilitários, formatadores, enums

**Regra**: features não importam outras features. Código compartilhado entre features vai para `shared/`.

### Estrutura de pastas dentro de uma feature

```
features/<modulo>/
├── api/          ← funções server-side (serverFetch) e hooks TanStack Query
├── components/   ← componentes do módulo
├── schemas/      ← zod schemas de validação
├── stores/       ← zustand store (somente se necessário)
└── types.ts      ← TypeScript types espelhando DTOs do backend
```

---

## 5. Integração com Backend

### URLs reais dos endpoints (backend implementado)

| Módulo | Método | Path | Role |
|---|---|---|---|
| Auth | POST | `/api/auth/login` | público |
| Auth | POST | `/api/auth/logout` | público |
| Auth | POST | `/api/auth/refresh` | público |
| Employee | GET | `/api/employees` | qualquer autenticado |
| Employee | GET | `/api/employees/{id}` | qualquer autenticado |
| Employee | POST | `/api/employees/register` | Manager |
| Employee | PATCH | `/api/employees/{id}` | Manager |
| Employee | DELETE | `/api/employees/{id}` | Manager |
| Customer | GET | `/api/customers` | qualquer autenticado |
| Customer | GET | `/api/customers/{id}` | qualquer autenticado |
| Customer | POST | `/api/customers/register` | qualquer autenticado |
| Customer | PATCH | `/api/customers/{id}` | qualquer autenticado |
| Customer | DELETE | `/api/customers/{id}` | Manager |
| Product | GET | `/api/produto` | qualquer autenticado |
| Product | POST | `/api/produto` | Manager |
| Product | PUT | `/api/produto/{id}` | Manager |
| Product | DELETE | `/api/produto/{id}` | Manager |
| Product | POST | `/api/produto/{id}/stock` | Manager |

> **Atenção**: Produto, Venda e Plano ainda não foram totalmente implementados no backend. Antes de implementar qualquer chamada, verificar os controllers reais no backend ou consultar o MCP `aquagas-docs`.

### Formato de resposta do backend

```typescript
// Sucesso
{
  success: true,
  data: T,
  error: null,
  timestamp: string
}

// Erro
{
  success: false,
  data: null,
  error: {
    code: string,
    message: string,
    details?: DataErrors[]
  },
  timestamp: string
}

// DataErrors (validação de campo)
// { field: string, message: string[] }
```

### Roles no backend

O backend usa `Manager` e `Employee` (C# enum). O frontend normaliza para `GERENTE` e `FUNCIONARIO`. A normalização já existe em `src/shared/auth/roles.ts` — usar `normalizeRole()` ao processar respostas.

### Como chamar o backend (Server Component)

Use sempre `serverFetch` de `@/shared/api/server-fetch`. Ele injeta o cookie `aquagas_access_token` automaticamente como Bearer token.

```typescript
// Em page.tsx ou em features/<modulo>/api/
import { serverFetch } from "@/shared/api/server-fetch";

const data = await serverFetch<ApiResponse<EmployeeResponse[]>>("/api/employees");
```

### Como chamar o backend (Client Component / mutation)

Crie um Route Handler em `app/api/<recurso>/route.ts` que faz proxy para o backend, ou use axios diretamente com o access token do cookie (ler via `document.cookie` não é opção — o token é httpOnly; usar o Route Handler como intermediário).

---

## 6. Regras de Negócio Relevantes

Estas regras existem no backend e o frontend deve respeitá-las visualmente (mostrar/esconder UI), mas a aplicação real é sempre no backend.

- **GERENTE** pode: registrar funcionários, editar funcionários, desativar funcionários, aplicar descontos em vendas e planos, acessar relatórios, cancelar planos
- **FUNCIONARIO** não pode: nenhuma das operações acima; apenas leitura e operações de venda sem desconto
- **CPF único**: o backend rejeita CPFs duplicados — mostrar erro de campo ao receber `fieldErrors`
- **Funcionários nunca são deletados fisicamente**: `DELETE /api/employees/{id}` desativa (`isActive = false`)
- **Clientes nunca são deletados fisicamente**: mesma regra
- **Estoque não pode ficar negativo**: o backend rejeita — mostrar erro ao usuário
- **Desconto apenas GERENTE**: esconder botão de desconto para FUNCIONARIO
- **Upgrade de plano**: sem penalidade. Downgrade e cancelamento: geram multa — exibir confirmação com valor da penalidade antes de confirmar

---

## 7. Padrões de Implementação

### Server Component (padrão para páginas)

```typescript
// app/(dashboard)/funcionarios/page.tsx
import { listFuncionarios } from "@/features/funcionario/api/funcionario.api";

export default async function FuncionariosPage({ searchParams }) {
  const query = { pageNumber: Number(searchParams.pageNumber ?? 1), pageSize: 10 };
  const data = await listFuncionarios(query);
  return <FuncionariosTable initialData={data} />;
}
```

### Client Component (ilha)

```typescript
"use client";
// features/funcionario/components/funcionarios-table.tsx
import { useQuery } from "@tanstack/react-query";

export function FuncionariosTable({ initialData }) {
  const { data } = useQuery({
    queryKey: ["funcionarios"],
    queryFn: fetchFuncionarios,
    initialData,
  });
  // ...
}
```

### Mutations (TanStack Query)

```typescript
const { mutate, isPending } = useMutation({
  mutationFn: (input: RegisterEmployeeInput) =>
    apiPost("/api/funcionarios/register", input),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
    toast.success("Funcionário cadastrado com sucesso");
  },
  onError: (error: ApiError) => {
    if (error.fieldErrors) {
      applyBackendErrors(error.fieldErrors, form.setError);
    } else {
      toast.error(error.message);
    }
  },
});
```

### Estado em URL (paginação e filtros)

Paginação e filtros ficam em `searchParams` da URL — não em `useState`. Ao mudar página ou filtro, usar `router.push` com os novos params. Isso permite que o Server Component re-execute e entregue HTML atualizado.

```
/funcionarios?pageNumber=2&pageSize=10&search=joao&sort=name:asc
```

---

## 8. Padrões de UI/UX

### Componentes base

Usar **shadcn/ui** para todos os componentes de UI. Não criar do zero o que shadcn já oferece (Button, Input, Select, Dialog, Table, Badge, etc.).

### Loading states

- Usar `loading.tsx` no App Router para Suspense automático em rotas
- Usar `<Skeleton>` do shadcn para skeletons de tabelas e cards
- Usar `isPending` do TanStack Query para estados de submissão de formulário

### Estados vazios e de erro

- Usar `<EmptyState>` de `@/shared/ui/empty-state` quando lista está vazia
- Usar `<ErrorState>` de `@/shared/ui/error-state` quando há erro de carregamento
- Usar `error.tsx` no App Router para error boundaries de rota

### Toasts

Usar **sonner** (`toast.success`, `toast.error`). O `<Toaster />` já está no root layout.

### Formatação

Usar sempre os formatadores de `@/shared/lib/formatters`:
- `formatCpf(value)` → `"123.456.789-00"`
- `formatPhone(value)` → `"(11) 98765-4321"`
- `formatDate(value)` → `"13/05/2026"`

### Controle de acesso visual

Verificar role antes de renderizar botões sensíveis:

```typescript
// Server Component
const role = await getCurrentUserRole(); // @/shared/auth/roles
const isManager = isGerente(role);
// ...
{isManager && <Button>Novo Funcionário</Button>}
```

---

## 9. Gerenciamento de Estado

### Estado de servidor → TanStack Query

Tudo que vem do backend (listas, detalhes, dados de formulário) é estado de servidor. Usar TanStack Query com `initialData` vindo do Server Component.

### Estado de cliente → Zustand

Usar Zustand apenas para:
- `auth-store` — `accessToken` (já existe em `src/shared/stores/`)
- `ui-store` — `mobileSidebarOpen` (já existe)
- `carrinho-store` — itens do PDV (a implementar)

Não criar stores Zustand para dados que vêm do backend.

### Estado de URL → `searchParams`

Paginação, filtros, ordenação e abas devem viver na URL. Não em `useState`.

---

## 10. Services, API Clients e Tipagens

### `serverFetch` — chamadas server-side

Localização: `src/shared/api/server-fetch.ts`

- Injeta cookies automaticamente (incluindo `aquagas_access_token` como Bearer)
- Lança `ApiError` em respostas não-ok
- Usar em `page.tsx`, `layout.tsx` e funções em `features/<modulo>/api/*.ts`

### `ApiError` — erros tipados

Localização: `src/shared/api/errors.ts`

```typescript
class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}
```

### Tipos das features

Cada feature tem `types.ts` com interfaces TypeScript espelhando os DTOs do backend. Ao adicionar um módulo:

1. Criar `features/<modulo>/types.ts` com os tipos baseados nos DTOs reais do backend
2. Criar `features/<modulo>/api/<modulo>.api.ts` com funções server-side
3. Criar hooks TanStack Query em `features/<modulo>/api/use-<modulo>.ts`

### Tipos já implementados (referência)

```typescript
// features/funcionario/types.ts
interface Funcionario {
  id: string;
  name: string;
  cpf: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
}

// DTOs de entrada (RegisterEmployeeInput do backend)
interface RegisterEmployeeInput {
  user: { userName: string; password: string; role: string };
  employee: { name: string; cpf: string; email: string; phone: string };
}
```

### Tipos dos DTOs do backend (para criar novos)

**LoginResponse**: `{ user: { userId, userName, role }, accessToken, expiresAt }`

**EmployeeResponse**: `{ id, name, cpf, email, phone }`

**EmployeeWithUserResponse**: `{ user: UserResponse, employee: EmployeeResponse }`

**CustomerResponse**: `{ id, name, document, typeDocument, email, phone, address: AddressResponse }`

**AddressResponse**: `{ id, street, neighborhood, number, complement?, city, cep }`

---

## 11. Validações e Tratamento de Erros

### Validação de formulários

Usar `zod` + `react-hook-form`. Schema em `features/<modulo>/schemas/`.

```typescript
// features/funcionario/schemas/register-funcionario.schema.ts
import { z } from "zod";

export const registerFuncionarioSchema = z.object({
  userName: z.string().min(3).max(100),
  password: z.string().min(8),
  name: z.string().min(1).max(200),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional(),
});
```

### Erros do backend em campos do formulário

O backend retorna `details: [{ field, message[] }]` quando há erros de validação. Mapear para os campos do react-hook-form:

```typescript
// Em onError do useMutation:
if (error instanceof ApiError && error.fieldErrors) {
  Object.entries(error.fieldErrors).forEach(([field, messages]) => {
    form.setError(field as FieldPath<FormData>, {
      message: messages[0]
    });
  });
}
```

### Erros de autorização

- **401** → redirecionar para `/login?expired=1`
- **403** → mostrar toast de permissão negada, não redirecionar
- **404** → mostrar `<ErrorState>` ou redirecionar para lista
- **400** → exibir erros de campo ou toast com `error.message`
- **5xx** → toast genérico "Erro interno. Tente novamente."

### Proteção de rotas

O middleware (`src/middleware.ts`) protege todas as rotas verificando o cookie `aquagas_refresh_token`. Se ausente, redireciona para `/login`. Isso é suficiente para proteção básica — controles finos de role são feitos no Server Component.

---

## 12. Testes e Critérios de Qualidade

> O projeto está em fase inicial. A estrutura de testes ainda não foi definida. Quando implementar:

- Testes unitários: vitest para lógica de formatação, normalização e schemas zod
- Testes de integração: testing-library + MSW para componentes com dados
- Não duplicar a validação do backend em testes — testar o que é responsabilidade do frontend

---

## 13. Convenções de Código

### Nomenclatura de arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente | kebab-case.tsx | `funcionarios-table.tsx` |
| Hook | use-kebab-case.ts | `use-funcionarios.ts` |
| Schema | kebab-case.schema.ts | `register-funcionario.schema.ts` |
| API function | kebab-case.api.ts | `funcionario.api.ts` |
| Types | types.ts por feature | `features/funcionario/types.ts` |
| Store | kebab-case.store.ts | `auth.store.ts` |

### Imports

Usar alias `@/` para imports absolutos:
```typescript
import { serverFetch } from "@/shared/api/server-fetch"; // correto
import { serverFetch } from "../../shared/api/server-fetch"; // errado
```

### TypeScript

- TypeScript strict habilitado — sem `any` sem justificativa
- Preferir `unknown` + narrowing a `any`
- Tipos derivados de interfaces do backend, não inventados

### Comentários

Não comentar o que o código já diz. Comentar apenas invariantes não óbvias (ex: por que um campo específico é normalizado de uma forma estranha).

---

## 14. O que a IA deve fazer antes de implementar uma feature

1. **Consultar o MCP `aquagas-docs`** — `get_module_blueprint`, `get_api_contract_hint`, `get_data_fetching_pattern` para o módulo em questão
2. **Verificar o controller backend real** — confirmar o path exato, método HTTP, body esperado e response shape
3. **Verificar se já existe código reutilizável** — checar `shared/`, `features/` e padrões estabelecidos como `funcionario.api.ts` e `funcionarios-table.tsx`
4. **Confirmar a role necessária** — qual operação exige Manager? Esconder UI para FUNCIONARIO?
5. **Verificar o formato de resposta** — o backend usa `ApiResponse<T>` com `{ success, data, error, timestamp }`. A função `serverFetch` já lida com isso — certificar que o tipo `T` está correto

Nunca assumir endpoints. Verificar o código do backend.

---

## 15. O que a IA não deve fazer

- **Não inventar endpoints** — verificar sempre os controllers do backend
- **Não criar lógica de negócio no frontend** — validações de domínio (CPF único, estoque negativo) pertencem ao backend
- **Não usar `any`** sem necessidade explícita
- **Não marcar layouts inteiros como `"use client"`** — quebraria a Islands Architecture
- **Não criar components client-only puramente estáticos** — badges, textos, headers são Server Components
- **Não buscar dados duas vezes** — se o Server Component já buscou, passar como `initialData` para o TanStack Query
- **Não criar stores Zustand para dados do servidor** — usar TanStack Query
- **Não importar uma feature dentro de outra feature** — usar `shared/`
- **Não criar componentes duplicados** — verificar se shadcn/ui ou `shared/ui` já tem o que é necessário
- **Não omitir tratamento de erros** — toda chamada de API deve tratar `ApiError`
- **Não hardcodar roles como strings** — usar `isGerente(role)` de `@/shared/auth/roles`
- **Não usar `document.cookie`** para ler tokens — os cookies de auth são httpOnly; usar Route Handlers como proxy

---

## 16. Checklist antes de finalizar qualquer task

- [ ] O endpoint do backend foi verificado no controller real (não assumido pela documentação)?
- [ ] O tipo TypeScript está alinhado com o DTO real do backend?
- [ ] O componente usa Server Component quando possível (sem `"use client"` desnecessário)?
- [ ] Paginação/filtros estão na URL (não em `useState`)?
- [ ] Erros de API são tratados com `ApiError` e exibidos ao usuário?
- [ ] Controles sensíveis (criar, editar, desativar) estão escondidos para FUNCIONARIO?
- [ ] O import usa alias `@/` (não caminho relativo `../../`)?
- [ ] Não há lógica de negócio duplicada do backend no frontend?
- [ ] Componentes reutilizáveis foram verificados em `shared/ui` antes de criar novos?
- [ ] Formatação de CPF, telefone e data usa `@/shared/lib/formatters`?

---

## Apêndice: Estado atual do projeto (maio 2026)

### Implementado e funcional
- Autenticação completa (login, logout, middleware, cookies)
- Listagem de funcionários com paginação, busca e ordenação
- Layout do dashboard (sidebar, topbar)
- Infraestrutura compartilhada (serverFetch, ApiError, roles, formatters)

### Parcialmente implementado
- Módulo `funcionario`: listagem pronta; CRUD (criar/editar/desativar) ainda não implementado no frontend

### Não iniciado
- Módulos: `cliente`, `produto`, `venda` (PDV), `plano`, `relatorio`
- TanStack Query provider e hooks de cliente
- Axios client com interceptors para mutations
- Formulários de criação/edição de qualquer entidade

### Divergências documentação vs implementação
- **Documentação** menciona rota `/api/v1/auth/login`; **backend real** usa `/api/auth/login` (sem `/v1/`)
- **Documentação** menciona roles `GERENTE`/`FUNCIONARIO`; **backend real** usa `Manager`/`Employee` — o frontend normaliza em `roles.ts`
- **Documentação** menciona rota `/api/v1/funcionario`; **backend real** usa `/api/employees`
- **Documentação** menciona rota `/api/v1/cliente`; **backend real** usa `/api/customers`
- A documentação técnica deve ser revisada para refletir os paths reais do backend
