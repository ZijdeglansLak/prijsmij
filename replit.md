# Workspace

## Overview

BestBod — een reverse-marketplace voor consumenten. Kopers plaatsen gratis een uitvraag voor een product (televisie, auto, wasmachine etc.), leveranciers/winkels bieden hierop aan met hun beste prijs. De laagste bieding staat bovenaan. Als een consument interesse heeft in een bod, wordt de leverancier gecontacteerd (later tegen kleine vergoeding).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind + shadcn/ui + framer-motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── marketplace/        # BestBod React frontend (main app, at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeder (categories + demo data)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Consumer Flow
- Plaatst gratis een uitvraag via productspecifieke templates
- Ziet hoeveel winkels al interesse hebben getoond
- Filtert op nieuw/refurbished/occasion
- Kan soortgelijke modellen toestaan
- Uitvragen verlopen na 7 dagen

### Unified Auth System
- Één login/register pagina (`/auth/login`, `/auth/register`) met rolkeuze (Koper / Verkoper)
- DB tabel `user_accounts` (role: buyer|seller), vervangt `supplier_accounts`
- JWT auth (bcryptjs hashing, 30d expiry) via `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- `UserAuthContext` in `contexts/user-auth.tsx`; backward-compat wrapper in `contexts/supplier-auth.tsx`
- Legacy routes `/supplier/login` en `/supplier/register` verwijzen door naar nieuwe auth-pagina's

### Rol-gebaseerde UI
- Alleen verkopers (role=seller) kunnen actieve uitvragen zien (gated met lock-screen)
- Alleen kopers (role=buyer) zien de "Uitvraag plaatsen" knop
- Aantal actieve winkels = aantal seller accounts in user_accounts

### Multilingual (i18n)
- Volledige vertalingen in NL / EN / DE / FR: `artifacts/marketplace/src/i18n/translations.ts`
- `I18nContext` in `contexts/i18n.tsx` met localStorage persistentie
- Taalkiezer in de navigatie (vlag + code); mobiel: tap om te wisselen

### Supplier Accounts (verkopers)
- Register/login met e-mail + wachtwoord (bcryptjs hashing, JWT auth, 30d expiry)
- Dashboard toont credits en connectiesgeschiedenis
- Credits kopen in bundels (10/50/100/250)
- Connectie systeem: 1 credit = koopcontactgegevens van koper ontvangen (na bod)
- `supplier_accounts`, `credit_purchases`, `connections` tabellen in DB

### Supplier Flow
- Bekijkt openstaande uitvragen van consumenten
- Plaatst een bod met prijs, conditie, garantie en levertijd
- Laagste bod staat bovenaan

### Admin
- Beheert categorieën en templates
- Template velden zijn configureerbaar per productcategorie
- Beschermd met wachtwoord (`admin123` of env `ADMIN_PASSWORD`)

## API Routes

All routes are prefixed with `/api`:

- `GET /healthz` — health check
- `GET /categories` — list categories with active request counts
- `GET /categories/:id` — category with template fields
- `GET /requests` — list active requests (filter: categoryId, offerType, search)
- `POST /requests` — create request (expires in 7 days)
- `GET /requests/:id` — request detail with bids sorted by price
- `GET /requests/:id/bids` — list bids (filter: offerType)
- `POST /requests/:id/bids` — place a bid
- `POST /requests/:id/interest` — express interest (triggers contact flow)
- `GET /stats` — marketplace statistics
- `POST /admin/categories` — create category (auth: x-admin-password header)
- `PUT /admin/categories/:id` — update category (auth required)

## Database Schema

- `categories` — product categories with jsonb template fields
- `requests` — consumer product requests (expire after 7 days)
- `bids` — supplier bids per request, sorted by price

## Seed Data

Run: `pnpm --filter @workspace/scripts run seed`

Seeds 8 categories (TV, Wasmachine, Laptop, Smartphone, Auto, Koelkast, Camera, Fiets) and demo requests/bids.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- `emitDeclarationOnly` — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerates API client and Zod schemas

## Development

- `pnpm --filter @workspace/api-server run dev` — start API server
- `pnpm --filter @workspace/marketplace run dev` — start frontend
- `pnpm --filter @workspace/db run push` — push DB schema changes
