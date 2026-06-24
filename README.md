# New-era

Aplicação fullstack pessoal para controle de academia e finanças, organizada em monorepo com foco em simplicidade e produtividade.

**App desktop (Electron)** disponível para Windows — notificações nativas, SQLite local, sem Docker.

> **Guia completo:** [GETTING_STARTED.md](./GETTING_STARTED.md) — web dev, desktop dev, build e download do instalador.

## Stack

- Frontend: Next.js (React + TypeScript + Tailwind CSS)
- Backend: NestJS (Node.js + TypeScript)
- Banco web: PostgreSQL (Docker)
- Banco desktop: SQLite (local, `%APPDATA%\New-Era`)
- ORM: Prisma
- Desktop: Electron 35 + electron-builder (Windows NSIS)

## Estrutura

```txt
app/
  web/      # frontend (http://localhost:6000 em dev)
  api/      # backend (http://localhost:6001 em dev)
  desktop/  # app Electron (API :6011, UI :6012)
  docker/   # docker compose do postgres
```

## Início rápido

| Objetivo | Comando |
|----------|---------|
| Web no navegador | `npm run db:up` → `npm run dev` → [localhost:6000](http://localhost:6000) |
| Desktop em dev | `npm run dev:desktop` |
| Gerar instalador | `npm run build:desktop` → `app/desktop/dist/New-Era Setup.exe` |

Detalhes, troubleshooting e download via GitHub Actions: **[GETTING_STARTED.md](./GETTING_STARTED.md)**.

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker Desktop (apenas para modo **web**)

## Como subir o banco (PostgreSQL)

Na raiz do projeto:

```bash
npm run db:up
```

Para derrubar:

```bash
npm run db:down
```

Configuração do banco:

- Host: `localhost`
- Porta: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `app_db`

## Variáveis de ambiente

### API

Copie:

```bash
cp app/api/.env.example app/api/.env
```

No Windows PowerShell:

```powershell
Copy-Item "app/api/.env.example" "app/api/.env"
```

### Web

Copie:

```bash
cp app/web/.env.example app/web/.env.local
```

No Windows PowerShell:

```powershell
Copy-Item "app/web/.env.example" "app/web/.env.local"
```

## Migrations e Prisma

Com o banco já ativo:

```bash
npm run prisma:migrate -w app/api
npm run prisma:generate -w app/api
```

Seed inicial (opcional):

```bash
npm run prisma:seed -w app/api
```

## Rodar projeto

Na raiz:

```bash
npm install
npm run dev
```

Serviços:

- Frontend: [http://localhost:6000](http://localhost:6000)
- Backend: [http://localhost:6001](http://localhost:6001)
- Health API: [http://localhost:6001/health](http://localhost:6001/health)

Observação de porta do frontend: o Next.js atual bloqueia diretamente a porta `6000`. Por isso o projeto sobe o Next em `6002` e usa um proxy local para expor o app final em `http://localhost:6000`.

## Endpoints base

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- User: `CRUD /users`
- Diet: `CRUD /diet`
- Workout: `CRUD /workout`
- Body measure: `CRUD /body-measure/measures` e `/body-measure/vitals`
- Finance:
  - `CRUD /finance/wallet`
  - `CRUD /finance/transaction`
  - `CRUD /finance/investment`

## Observações

- Se `prisma migrate dev` falhar com `P1001`, o Docker/Postgres não está ativo.
- O dashboard web já consome `GET /health` para validar integração com a API.
