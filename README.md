# Productlytics

Product passports. Organisations sign in to manage their product catalogue, then publish
individual products to a public "passport" page that anyone with the link can view — no
account required. Unpublishing kills the link instantly.

```
  apps/web                              apps/server
  React 19 + TanStack Router/Query      Express 5 + zod
  http://localhost:3001                 http://localhost:3000
        │                                     │
        │  fetch + httpOnly JWT cookie        │  Drizzle ORM
        ▼                                     ▼
  ┌───────────┐                        ┌─────────────────────────────┐
  │  browser  │                        │  PostgreSQL (local)         │
  └───────────┘                        │  migrations: drizzle-kit    │
                                       │  organizations · users ·    │
  /p/{publicId}  ── no auth ─────────▶ │  products · documents       │
                                       └─────────────────────────────┘
  uploaded files: local disk behind a StorageBackend interface (swappable)
```

## Prerequisites

- **Node.js 20+**
- **pnpm 10** — the repo pins `pnpm@10.26.2` via `packageManager`, so `corepack enable`
  gets you the right version (or `npm i -g pnpm`)
- **PostgreSQL running on `localhost:5432`** — no Docker in this repo (deliberate, see
  below). Any existing database works; the default `postgres` database is fine.

## How to run it

**1. Create the two env files** (not committed). These values work as-is — only the
user/password in `DATABASE_URL` may need to match your local Postgres:

`apps/server/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
JWT_SECRET=any-random-string
CORS_ORIGIN=http://localhost:3001
```

`apps/web/.env`

```env
VITE_SERVER_URL=http://localhost:3000
```

**2. Two commands:**

```bash
pnpm bootstrap   # installs dependencies, runs migrations, seeds demo data
pnpm dev         # starts API on :3000 and web on :3001
```

Open <http://localhost:3001> and log in with the credentials below.

Optional extras:

```bash
pnpm db:studio   # browse the DB in Drizzle Studio
pnpm db:seed     # reset the DB to the seeded state (truncates all tables first)
pnpm dev:web     # run only the frontend
pnpm dev:server  # run only the API
```

## Seeded credentials

| Email             | Password   | Organisation |
| ----------------- | ---------- | ------------ |
| `user1@gmail.com` | `password` | org_1        |
| `user2@gmail.com` | `password` | org_2        |

The seed creates 30 products (15 per org, roughly half already published with live
passport URLs). Both orgs deliberately contain the same `SKU-001`…`SKU-015` — SKU
uniqueness is **per organisation**, enforced by a DB constraint.

A quick tour: log in as `user1`, open a published product, copy its passport link from
the detail page, open it in a private window (no session needed), then unpublish and
reload — the link 404s.

## API surface

| Method                | Path                          | Notes                                          |
| --------------------- | ----------------------------- | ---------------------------------------------- |
| POST                  | `/api/auth/login` / `logout`  | JWT in signed httpOnly cookie                  |
| GET                   | `/api/auth/me`                | current user + org                             |
| GET                   | `/api/products`               | own org only; pagination, search, filters      |
| POST / GET / PATCH / DELETE | `/api/products(/:id)`   | CRUD, org-scoped; publish = `PATCH {status}`   |
| GET                   | `/api/p/:publicId`            | public passport; published only, field allowlist |
| POST / GET            | `/api/products/:id/documents` | upload (PDF/PNG/JPG, ≤5 MB) and list           |
| GET                   | `/api/documents/:id`          | file bytes; own org, or anyone while published |

## Project structure

```
Productlytics/
├── apps/
│   ├── web/          # React + TanStack Router/Query (Vite, :3001)
│   └── server/       # Express 5 API (:3000) — routes/, lib/ (session, storage)
└── packages/
    ├── db/           # Drizzle schema (one file per table), migrations, seed
    ├── ui/           # shared UI primitives (Base UI + Tailwind)
    ├── env/          # zod-validated env schemas (server + web)
    └── config/       # shared tsconfig
```
