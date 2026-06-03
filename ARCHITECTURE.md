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

### Layout e Grid (padrão visual / sem scroll da página)

- **Regra principal (dashboard)**: o app tem estilo **dashboard** e **não deve ter scroll lateral nem vertical na página** (sem scroll no `<body>` / viewport) em nenhuma tela do dashboard.  
  - **Exceção**: telas de autenticação/login podem ter scroll próprio conforme necessidade.
  - Se houver overflow de conteúdo no dashboard, ele deve acontecer **dentro dos cards/áreas internas** (ex.: listas com `overflow-auto`), mantendo o layout “travado” no limite da viewport/área de conteúdo.

- **Margens/paddings globais do conteúdo**:
  - O wrapper do conteúdo deve manter **padding simétrico** em cima/baixo e um “respiro” consistente nas laterais em **todas as resoluções** (exceto login).
  - O dashboard usa **gutter fixo** (mesmo valor para topo/baixo e laterais). Ex.: `py-[1.5rem]` e `pr-[1.5rem]`.
  - Com sidebar fixa, manter o deslocamento do conteúdo via `pl-[calc(<sidebarWidth>+<gutter>)]` (ex.: `360px + 1.5rem]`) para garantir o mesmo “respiro” após a sidebar.
  - **Não usar `max-w`/`mx-auto` no wrapper do dashboard**: o conteúdo deve ocupar **100% da largura disponível** dentro do gutter, para não criar “margem extra” em telas largas e manter o espaço lateral consistente.

- **Grid pai (container do dashboard)**:
  - Deve ocupar **toda a altura disponível** do `<main>`: usar `className="flex h-full min-h-0 flex-1 flex-col ..."` e, no breakpoint `lg`, habilitar `grid`.
  - Sempre manter `min-h-0` no container e nos filhos que precisam encolher (`flex`/`grid`), para o browser permitir o cálculo correto e evitar overflow.
  - Preferir `gap-2.5` (padrão do projeto) para consistência visual.

- **Linhas do grid**:
  - Evitar `auto` como “máximo” quando isso puder estourar altura disponível. Padrão seguro:
    - `gridTemplateRows: '<topPx> minmax(0, 1fr)'`
  - Quando copiar o padrão da Home, usar:
    - `gridTemplateRows: 'minmax(180px, auto) minmax(320px, 1fr)'`
    - e garantir que o conteúdo que possa crescer tenha `min-h-0` + `overflow-auto` (para não empurrar o grid pai).

- **Scroll interno (cards/listas)**:
  - Para listas/tabelas dentro de cards: `min-h-0 flex-1 overflow-auto`.
  - Se um card precisar “segurar” conteúdo sem expandir o layout: `overflow-hidden` no card + scroll em um filho interno.

- **Padding vertical do conteúdo**:
  - Manter padding consistente em cima/baixo (ex.: `py-6`) no wrapper do conteúdo.
  - Se houver qualquer indício de scroll de página por soma de alturas, revisar o wrapper para garantir:
    - `h-screen` + `overflow-hidden` no container raiz do layout (dashboard)
    - `<main>` com `min-h-0 flex-1` e `overflow-hidden` (dashboard)
    - grid pai com `h-full min-h-0 flex-1` e filhos com `min-h-0` para permitir scroll interno.

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
8. Garantir que o grid pai respeita o limite de **height/width** do layout (sem scroll vertical na página), mantendo o mesmo padrão das páginas já criadas.
