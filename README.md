# AquaGás — Frontend

Interface web para gestão operacional da **AquaGás Distribuidora**, uma empresa distribuidora de água e gás. O sistema cobre o ciclo completo: gestão de funcionários, clientes, produtos, ponto de venda (PDV), planos de assinatura com entregas periódicas e relatórios gerenciais.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Rodando o Projeto](#rodando-o-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Arquitetura](#arquitetura)
- [Módulos](#módulos)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Testes](#testes)

---

## Visão Geral

O frontend serve como camada de apresentação e proxy de autenticação de um sistema fullstack. Toda regra de negócio e autorização vive no backend — o frontend apresenta dados, coleta entradas do usuário e repassa as chamadas via Route Handlers (proxy interno do Next.js).

**Dois perfis de acesso:**

| Perfil | Permissões |
|---|---|
| `FUNCIONARIO` | Leitura geral, registro de vendas e confirmação de entregas/cobranças |
| `GERENTE` | Tudo acima + criar/editar funcionários, descontos, cancelamentos, relatórios, gestão de planos |

---

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.x | Framework, App Router, SSR, Route Handlers |
| React | 19.x | UI |
| TypeScript | 5.x | Tipagem estrita |
| TanStack Query | 5.x | Estado de servidor, cache, mutations |
| Zustand | 5.x | Estado de cliente (sessão, carrinho PDV, UI) |
| react-hook-form + zod | — | Formulários e validação |
| axios | 1.x | HTTP client com interceptors |
| shadcn/ui + Tailwind CSS | 4.x | Componentes e estilização |
| sonner | — | Toasts |
| recharts | 3.x | Gráficos nos relatórios |
| react-imask | — | Máscaras de input (CPF, CNPJ, telefone) |
| date-fns | 3.x | Formatação de datas |
| @iconify/react | — | Ícones |
| Vitest + Testing Library | — | Testes unitários e de componente |
| Playwright | — | Testes end-to-end |
| MSW | 2.x | Mock de API nos testes |

---

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Backend AquaGás rodando (necessário para desenvolvimento e testes E2E)

---

## Configuração do Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL base do backend (sem trailing slash)
BACKEND_URL=http://localhost:5000

# Segredo para assinar cookies (opcional, gerado automaticamente em dev)
COOKIE_SECRET=seu_segredo_aqui
```

> Em produção, configure `BACKEND_URL` com a URL real do servidor backend e defina `COOKIE_SECRET` com um valor forte e aleatório.

---

## Rodando o Projeto

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). O backend deve estar rodando em paralelo.

---

## Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Iniciar build de produção

npm run lint             # Verificar problemas de lint
npm run lint:fix         # Corrigir problemas de lint automaticamente
npm run format           # Formatar código com Prettier
npm run format:check     # Verificar formatação sem alterar

npm run test             # Rodar todos os testes unitários e de componente
npm run test:unit        # Apenas testes unitários
npm run test:component   # Apenas testes de componente
npm run test:watch       # Modo watch (vitest)
npm run test:coverage    # Relatório de cobertura

npm run test:e2e         # Testes end-to-end com Playwright
npm run test:all         # Unitários + componente + E2E
```

---

## Estrutura de Pastas

```
src/
├── app/                          # App Router (Next.js)
│   ├── (auth)/                   # Grupo de rotas públicas
│   │   └── login/
│   ├── (dashboard)/              # Grupo de rotas protegidas
│   │   ├── _home/                # Página inicial (fora das features)
│   │   ├── customers/
│   │   ├── employees/
│   │   ├── plans/
│   │   ├── products/
│   │   ├── reports/
│   │   └── sales/
│   └── api/                      # Route Handlers (proxy para o backend)
│       ├── auth/
│       ├── customers/
│       ├── employees/
│       ├── penalties/
│       ├── plans/
│       ├── products/
│       └── sales/
│
├── features/                     # Lógica e UI por domínio
│   ├── auth/
│   │   ├── api/                  # Funções de autenticação
│   │   ├── components/           # LoginForm, SessionExpiredDialog
│   │   ├── guards/               # RoleGuard
│   │   ├── hooks/                # useLogin, useLogout
│   │   ├── schemas/              # Zod schemas dos formulários
│   │   └── stores/               # auth-store (Zustand)
│   ├── customer/
│   ├── employee/
│   ├── plan/
│   ├── product/
│   ├── report/
│   └── sale/
│       └── store/                # cart-store (PDV)
│
├── shared/                       # Código reutilizável entre features
│   ├── api/
│   │   ├── backend-proxy.ts      # Helper para Route Handlers
│   │   ├── client.ts             # Axios client (chamadas client-side)
│   │   ├── errors.ts             # ApiError tipado
│   │   └── server-fetch.ts       # Fetch server-side com auth
│   ├── auth/
│   │   ├── cookies.ts            # Nomes dos cookies httpOnly
│   │   ├── roles.ts              # normalizeRole, isGerente
│   │   └── server.ts             # Leitura de role em Server Components
│   ├── hooks/
│   │   ├── use-has-role.ts       # Hook de controle de acesso visual
│   │   ├── use-viacep-lookup.ts  # Autocomplete de endereço por CEP
│   │   ├── use-wizard.ts         # Wizard multi-step
│   │   └── use-media-query.ts
│   ├── layouts/
│   │   ├── detail-shell.tsx      # Layout de página de detalhe
│   │   ├── settings-shell.tsx    # Layout de página de configurações
│   │   └── wizard-shell.tsx      # Layout de wizard
│   ├── lib/
│   │   ├── formatters.ts         # formatCpf, formatCurrency, formatDate…
│   │   ├── masks.ts              # Máscaras de input
│   │   ├── validators.ts         # Validadores reutilizáveis
│   │   ├── error-codes.ts        # Mapeamento de códigos de erro do backend
│   │   └── csv.ts                # Exportação CSV dos relatórios
│   ├── providers/
│   │   ├── auth-provider.tsx     # Inicialização da sessão no cliente
│   │   ├── query-provider.tsx    # TanStack Query client
│   │   └── theme-provider.tsx    # Tema dark/light
│   ├── store/
│   │   └── ui-store.ts           # Estado da sidebar mobile
│   ├── types/
│   │   └── api.ts                # ApiResponse<T>, Paginated<T>
│   └── ui/                       # 28 componentes compartilhados
│       ├── action-overflow-menu.tsx
│       ├── confirm-dialog.tsx
│       ├── currency-field.tsx
│       ├── data-list.tsx
│       ├── data-table.tsx
│       ├── date-picker.tsx
│       ├── date-range-picker.tsx
│       ├── empty-state.tsx
│       ├── entity-header.tsx
│       ├── error-state.tsx
│       ├── form-field.tsx
│       ├── form-footer.tsx
│       ├── form-section.tsx
│       ├── info-card.tsx
│       ├── page-header.tsx
│       ├── progress-bar.tsx
│       ├── quantity-input.tsx
│       ├── responsive-tabs-list.tsx
│       ├── stat-card.tsx
│       ├── stepper.tsx
│       ├── theme-toggle.tsx
│       ├── vertical-tabs.tsx
│       └── wizard-progress.tsx
│
└── __tests__/                    # Suite de testes
    ├── unit/                     # Schemas, formatters, stores, arquitetura
    ├── component/                # Componentes com dados mockados (MSW)
    ├── e2e/                      # Fluxos críticos (Playwright)
    ├── mocks/
    │   ├── handlers.ts           # MSW request handlers
    │   └── builders.ts           # Factories de dados de teste
    └── setup.ts                  # Configuração global (MSW, jest-dom)
```

### Estrutura interna de cada feature

```
features/<modulo>/
├── api/          # Funções server-side (serverFetch) e client-side (axios)
├── components/   # Componentes do módulo
├── hooks/        # Hooks TanStack Query (queries e mutations)
├── lib/          # Parsers de erro específicos do módulo
├── schemas/      # Zod schemas dos formulários
└── types.ts      # Types espelhando DTOs do backend
```

---

## Arquitetura

### Islands Architecture

O paradigma adotado é **Server Components por padrão**. Componentes são marcados com `"use client"` apenas quando precisam de:

- Handlers de evento (`onClick`, `onChange`)
- Hooks de estado (`useState`, `useEffect`)
- APIs do browser
- Bibliotecas client-only (TanStack Query, Zustand, react-hook-form)

Layouts, headers, badges e componentes puramente visuais permanecem como Server Components — zero JavaScript enviado ao cliente para essas partes.

### Proxy de Autenticação via Route Handlers

Client Components **nunca chamam o backend diretamente**. O fluxo é:

```
Client Component
      │
      ▼
  /api/<recurso>/route.ts   ← Route Handler (Next.js)
      │  injeta Bearer token do cookie httpOnly
      ▼
    Backend
```

Isso mantém os tokens de acesso fora do JavaScript do browser e simplifica o tratamento de refresh automático.

### Camadas e dependências

```
app/ → features/<modulo>/ → shared/
```

Features não importam outras features. Código compartilhado entre dois ou mais módulos sempre vai para `shared/`.

### Estado

| Tipo de estado | Solução |
|---|---|
| Dados do servidor (listas, detalhes) | TanStack Query |
| Sessão do usuário | Zustand (`auth-store`) |
| Carrinho PDV | Zustand (`cart-store`) |
| Sidebar mobile | Zustand (`ui-store`) |
| Paginação, filtros, ordenação | `searchParams` da URL |

---

## Módulos

| Módulo | Rotas |
|---|---|
| Home | `/` |
| Autenticação | `/login` |
| Funcionários | `/employees` |
| Clientes | `/customers`, `/customers/[id]` |
| Produtos | `/products`, `/products/[id]` |
| PDV (Vendas) | `/sales/new`, `/sales/[id]` |
| Planos | `/plans`, `/plans/new`, `/plans/[id]` |
| Relatórios | `/reports/sales`, `/reports/stock`, `/reports/penalties` |

---

## Autenticação e Segurança

- Tokens armazenados em cookies **httpOnly** — inacessíveis ao JavaScript do browser
- Middleware Next.js protege todas as rotas do dashboard, verificando e renovando o access token automaticamente
- Refresh token rotativo: o Route Handler de refresh troca o par de tokens a cada renovação
- Em caso de refresh inválido, o usuário é redirecionado para `/login?expired=1`
- Controle de acesso visual por role usando `useHasRole()` (client) e `isGerente()` (server)
- A autorização real é sempre aplicada pelo backend

---

## Testes

A suite cobre três camadas:

**Unitários** (`src/__tests__/unit/`) — executados com Vitest, sem DOM:
- Schemas zod
- Formatters e validators
- Stores Zustand
- Funções de API e parsers de erro
- Boundaries de importação entre camadas

**Componente** (`src/__tests__/component/`) — Vitest + Testing Library + MSW:
- Tabelas com paginação e filtros
- Formulários e dialogs
- Guards de role (o que cada perfil vê)
- Estados de loading, vazio e erro

**E2E** (`src/__tests__/e2e/`) — Playwright com mock de backend (MSW service worker):
- Fluxo de autenticação
- Listagens e navegação
- PDV completo
- Permissões por role

```bash
# Rodar apenas o que for necessário
npm run test:unit       # rápido, sem browser
npm run test:component  # componentes isolados
npm run test:e2e        # fluxos completos (requer Playwright instalado)
```

Para instalar os browsers do Playwright na primeira vez:

```bash
npx playwright install
```
