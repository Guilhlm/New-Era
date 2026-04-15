# Arquitetura e Convenções do Projeto (New-era)

Este documento define as regras oficiais de arquitetura para manter o código escalável, desacoplado e testável.

## Visão geral

- **Monorepo (npm workspaces)**:
  - `app/web`: Frontend Next.js (App Router) + React + TypeScript + Tailwind.
  - `app/api`: Backend NestJS + TypeScript + Prisma + PostgreSQL.
- **Portas (dev)**:
  - Web final em `http://localhost:6000` via proxy; Next em `http://localhost:6002`.
  - API em `http://localhost:6001`.

## Princípios obrigatórios (Frontend 2025)

### 1) Separação de responsabilidades

- Componentes de UI devem ser presentacionais.
- Lógica de estado, regras e handlers ficam em custom hooks (`useXxx`).
- I/O (fetch, mutations, integração HTTP) fica em `src/services/**` e route handlers (`src/app/api/**`).
- Não misturar regra de negócio dentro do JSX.

### 2) Single Responsibility

- Cada componente deve ter responsabilidade única e foco claro.
- Componentes grandes devem ser quebrados em componentes menores e reutilizáveis.
- Hooks “god object” devem ser divididos por domínio/função.

### 3) Estado desacoplado

- Não passar objetos grandes entre componentes.
- Estruturar props em blocos previsíveis:
  - `data`
  - `actions`
  - (opcional) `ui` para estado de visualização.
- Evitar alto acoplamento entre UI e shape interno de hooks.

### 4) Hooks previsíveis e testáveis

- Hooks concentram:
  - estado
  - regras
  - handlers
- Hooks devem retornar contrato estável e explícito (objeto nomeado).
- Preferir dependências injetáveis em hooks que fazem I/O quando necessário para testes.

### 5) JSX limpo

- Evitar lógica inline complexa no JSX.
- Normalizações, cálculos de estado visual e derivação de classes devem ser preparadas no hook/container.
- JSX deve se limitar à composição de componentes e bind de props.

### 6) Reutilização de formulário

- Campos repetidos devem ser abstraídos em componentes reutilizáveis (`FormField`, `AuthField`, etc.).
- Regras de estilo/estrutura de input não devem ser copiadas em múltiplos componentes.

### 7) Padronização de classes dinâmicas

- Usar utilitário de composição de classes (`cn` estilo `clsx`) em vez de concatenação manual.
- Variantes de UI devem ser centralizadas em componentes base (`components/ui`).

## Estrutura recomendada

```txt
app/web/src/
  app/                    # rotas, layouts, route handlers (BFF)
  components/
    ui/                   # primitives reutilizáveis
    auth/                 # UI de autenticação
    perfil/               # UI de perfil
  hooks/                  # hooks de domínio e hooks transversais
  services/               # camada HTTP tipada para BFF/API
  types/                  # contratos compartilhados
  utils/                  # funções puras
  lib/                    # utilitários core
```

## Convenções de frontend

### Componentes

- `components/ui/**`: componentes base e genéricos.
- `components/<feature>/**`: componentes de domínio.
- Componentes de feature não devem fazer fetch direto se houver hook/camada de serviço.

### Hooks

- Nome padrão: `useXxx`.
- Separar hooks por responsabilidade:
  - query/load (`useProfileQuery`)
  - form state e submit (`useProfileForm`)
  - fluxo específico (`usePasswordField`, `useLogout`).

### Serviços

- `src/services/http.ts`: base de transporte e normalização de erro.
- `src/services/<dominio>.ts`: funções tipadas de alto nível (`login`, `register`, `updateProfile` etc.).
- Componentes não devem chamar `fetch` diretamente quando já existe serviço/hook de domínio.

### Route handlers (BFF)

- `src/app/api/**/route.ts` atua como BFF:
  - lida com cookies/tokens
  - normaliza erros
  - retorna contrato consistente (`{ error: string }` em falha).

### Server vs Client no App Router

- Server Components por padrão.
- Usar `'use client'` somente quando houver:
  - estado local
  - eventos
  - `useEffect`
  - APIs de browser.

## Backend (`app/api`)

- Módulos por domínio em `src/modules/<dominio>/`.
- `controller`: entrada HTTP e DTOs.
- `service`: regra de negócio.
- Prisma centralizado em `src/prisma`.
- Nunca retornar dados sensíveis (`passwordHash`, etc.).

## Qualidade e previsibilidade

- Rodar `npm run lint` antes de finalizar alterações.
- Rodar build (`npm run build`) para validar contratos e tipos.
- Preferir mudanças incrementais por domínio em vez de refactor gigante sem checkpoints.

## Checklist para nova feature (Web)

1. Criar rota/página no App Router.
2. Criar serviços tipados para chamadas HTTP necessárias.
3. Criar hook(s) de domínio para estado/regras/handlers.
4. Criar componentes presentacionais (UI pura).
5. Compor a feature via container que conecta hook + UI.
6. Garantir contratos (`data/actions`) e evitar prop drilling acoplado.
7. Validar lint/build.

