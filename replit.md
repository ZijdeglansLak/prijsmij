# Workspace

## Overview

PrijsMij — een Dutch reverse-marketplace voor consumenten. Kopers plaatsen gratis een uitvraag voor een product (televisie, auto, wasmachine etc.), leveranciers/winkels bieden hierop aan met hun beste prijs. De laagste bieding staat bovenaan. Als een consument interesse heeft in een bod, betaalt de leverancier 1 credit om de contactgegevens te ontvangen ("Connectie").

## Versieconventie

- Versienummer zichtbaar in `artifacts/marketplace/src/App.tsx` (onderaan elke pagina)
- **Regel: bij élke git push naar GitHub het versienummer met 0.1 ophogen**
- Commit als: `release: vX.X - omschrijving`
- Huidige versie: **v4.30** (avatar feature: upload/verwijder profielfoto via POST/DELETE /api/auth/avatar; GET /api/users/:id/avatar; `AvatarUpload` widget in profile + supplier-dashboard; `UserAvatar` component in bid cards; `avatar_data text` DB kolom; sharp 400×400 JPEG resize)

## BELANGRIJK: Taalselectie vlaggen

De vlaggen bij de taalselectie (🇳🇱 🇬🇧 🇩🇪 🇫🇷) staan in `artifacts/marketplace/src/contexts/i18n.tsx`.
Ze zijn opgeslagen als **Unicode escape-codes** (`\uD83C\uDDF3` etc.) om te voorkomen dat ze beschadigd raken bij bestandsbewerkingen.
- **Wijzig NOOIT** de `FLAG` constante naar emoji-literals (bijv. `"🇳🇱"`)
- De Unicode escapes zijn equivalent: `"\uD83C\uDDF3\uD83C\uDDF1"` = 🇳🇱
- Als de vlag verdwijnt: controleer of `FLAG` nog correct is in `i18n.tsx`

## Recente Features (v2.0)

### Kennisbank & Quootje Chatbot
- **Kennisbank tab** in het beheerscherm: CRUD-beheer van kennisbank-items (titel + inhoud), alleen zichtbaar voor admins; opgeslagen in `kennisbank` DB tabel
- **Quootje chatbot**: knop rechtsonder op alle pagina's, alleen zichtbaar voor ingelogde gebruikers
- Chatbot gebruikt OpenAI (gpt-5.2) via Replit AI Integrations (SSE streaming)
- Systeemprompt bevat strikte regels: geen internet, geen DB-wijzigingen, geen technische info, winkeliers zien uitvragen, kopers niet
- Hackdetectie blokkeert gebruiker en stuurt admin e-mail
- Nieuwe DB tabellen: `kennisbank`, `conversations`, `messages`
- Nieuwe API routes: `GET/POST/PUT/DELETE /api/admin/kennisbank`, `POST /api/chatbot/message`
- Lib: `@workspace/integrations-openai-ai-server` toegevoegd

## Recente Features (v1.8)

### Categorie-groepen
- `category_groups` DB tabel; nullable `group_id` FK op `categories`
- Admin CRUD via `/api/admin/category-groups`; publieke GET op `/api/category-groups`
- Homepage toont categorieën gegroepeerd per groep (met groepshoofd + scheidingslijn)
- Uitvragen-zijbalk toont groepsnamen als tussenkoppen boven categorieën
- Admin "Categorieën" tab: uitklapbaar groepenbeheer panel + groep-dropdown per categorie

### Iconen-bibliotheek
- Object Storage (GCS) opgezet via Replit
- `icon_library` DB tabel: id, name, object_path, created_at
- Admin routes: `GET/POST/DELETE /api/admin/icon-library`, `POST /api/admin/icon-library/upload-url`
- Storage serving: `GET /api/storage/objects/*` (privaat), `GET /api/storage/public-objects/*` (publiek)
- `IconPicker` component (`/src/components/icon-picker.tsx`): modal met emoji-invoer, upload, bibliotheek-grid
- `IconDisplay` component: rendert automatisch emoji of afbeelding (op basis van slash-prefix)
- Gebruikt in CategoryCard (edit) en CategoryGroupManager (edit + nieuw) in admin.tsx
- Homepage en uitvragen-pagina gebruiken `IconDisplay` voor iconen

### Seed-data
- 400 test uitvragen in de DB: 50 per categorie (8 categorieën), diverse merken + kopers
- Seed ook in `ensure-tables.ts` zodat nieuwe deploys ook 400 uitvragen krijgen bij lege DB

## Seller Category Notifications

- **DB column**: `user_accounts.notification_category_ids` (`text NOT NULL DEFAULT '[]'`) — JSON array of category IDs the seller watches
- **API endpoints**:
  - `GET /api/supplier/notification-preferences` — returns `{ categoryIds: number[] }`
  - `PUT /api/supplier/notification-preferences` — saves `{ categoryIds: number[] }`
- **Email trigger**: When `POST /requests` succeeds, all sellers whose `notification_category_ids` includes the new request's category receive a Dutch notification email (fire-and-forget)
- **Dashboard UI**: Supplier dashboard shows checkbox grid per active category; saves preferences with confirmation toast

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
│   └── marketplace/        # PrijsMij React frontend (main app, at /)
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

### Consumer (Buyer) Flow
- Plaatst gratis een uitvraag via productspecifieke templates
- Ziet openbare categorielijst met uitvraagtellingen zonder login
- Filtert op nieuw/refurbished/occasion
- Kan soortgelijke modellen toestaan
- Uitvragen verlopen na 7 dagen

### Unified Auth System
- Één login/register pagina (`/auth/login`, `/auth/register`) met rolkeuze (Koper / Verkoper)
- Login accepteert e-mail OF gebruikersnaam
- DB tabel `user_accounts` (role: buyer|seller, isAdmin bool)
- JWT auth (bcryptjs hashing, 30d expiry) via `/api/auth/*`
- Routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile` (PUT)
- Email verificatie: `/api/auth/verify-email`, `/api/auth/resend-verification`
- Wachtwoord reset: `/api/auth/forgot-password`, `/api/auth/reset-password`
- `UserAuthContext` in `contexts/user-auth.tsx` — exposes `isAdmin`, `emailVerified`, `updateUser()`
- Legacy routes `/supplier/login` en `/supplier/register` verwijzen door naar nieuwe auth-pagina's

### Rol-gebaseerde UI
- **Kopers**: zien openbare categoriepagina op `/requests`, kunnen uitvraag plaatsen
- **Verkopers**: zien actieve uitvragen, kunnen bieden, credits kopen
- **Beheerders**: zien "Beheer" nav link + zoekbalk; toegang tot `/admin`
- Admin check in `requireAdmin` middleware (JWT `isAdmin` claim)

### Admin Backend
- Admin account: e-mail `admin@prijsmij.nl`, gebruikersnaam `admin`, wachtwoord `welkom12345`
- `isAdmin=true` in DB voor admin account (id=37)
- Routes: `GET /api/admin/users`, `PUT /api/admin/users/:id`, `POST /api/admin/users`
- Admin kan: naam, rol, isAdmin, wachtwoord wijzigen per gebruiker
- Admin kan nieuwe beheerders aanmaken

### Email Service
- `artifacts/api-server/src/services/email.ts` met nodemailer
- NL/EN/DE/FR templates voor verificatie + wachtwoord-reset e-mails
- Fallback: console.log + link in API response als geen SMTP geconfigureerd
- SMTP env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### Seller Email Domain Warning
- Vrije e-maildomeinen lijst wordt gecheckt client-side (register pagina) EN server-side
- `domainWarning` veld in register response
- Waarschuwingsberichten in alle 4 talen

### Multilingual (i18n) — Volledig
- Volledige vertalingen in NL / EN / DE / FR: `artifacts/marketplace/src/i18n/translations.ts`
- Alle secties compleet: nav, home, stats, auth (incl. forgot/reset/verify keys), requests, detail, bid, dashboard, credits, general, profile, footer
- `I18nContext` in `contexts/i18n.tsx` met localStorage persistentie
- Taalkiezer in de navigatie (vlag + code)

### Credit/Connectie Systeem
- Verkopers kopen credits in bundels (10/50/100/250)
- 1 credit = contactgegevens koper ontvangen (na bod + interesse)
- Tabellen: `credit_purchases` en `connections` (supplier_id NULLABLE)

### Profile Management
- `/profile` pagina: naam wijzigen, wachtwoord wijzigen
- Toont e-mailverificatiestatus; herinneringslink als niet geverifieerd

## API Routes

All routes are prefixed with `/api`:

- `GET /healthz` — health check
- `GET /categories` — list categories with active request counts
- `GET /requests` — list active requests (filter: categoryId, offerType, search)
- `POST /requests` — create request (expires in 7 days)
- `GET /requests/:id` — request detail with bids sorted by price
- `POST /requests/:id/bids` — place a bid
- `POST /requests/:id/interest` — express interest
- `POST /requests/:id/connect` — use 1 credit, get buyer contact info
- `GET /stats` — marketplace statistics
- **Auth routes:**
  - `POST /auth/register` — register buyer or seller
  - `POST /auth/login` — login (email or username)
  - `GET /auth/me` — current user
  - `PUT /auth/profile` — update name or password
  - `POST /auth/verify-email` — verify token from email link
  - `POST /auth/resend-verification` — resend verification email
  - `POST /auth/forgot-password` — request password reset
  - `POST /auth/reset-password` — set new password with token
- **Admin routes (requireAdmin middleware):**
  - `POST /admin/categories` — create category
  - `PUT /admin/categories/:id` — update category
  - `GET /admin/users` — list all users
  - `PUT /admin/users/:id` — update user (name/role/isAdmin/password)
  - `POST /admin/users` — create new admin account

## Database Schema (lib/db/src/schema)

- `user_accounts` — unified buyer+seller accounts (id, role, contactName, storeName, email, username, password_hash, credits, isAdmin, emailVerified, verificationToken, resetToken, resetTokenExpiry)
- `categories` — product categories with jsonb template fields
- `requests` — consumer product requests (expire after 7 days)
- `bids` — supplier bids per request, sorted by price
- `credit_purchases` — credit purchase history (supplier_id NULLABLE)
- `connections` — buyer-seller connections via credits (supplier_id NULLABLE)

## Frontend Pages

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `home.tsx` | Landing page |
| `/requests` | `requests.tsx` | Public category grid (non-sellers); full list (sellers) |
| `/requests/:id` | `request-detail.tsx` | Bid listing, connect CTA |
| `/request/new` | `create-request.tsx` | Buyer: post request |
| `/requests/:id/bid` | `place-bid.tsx` | Seller: place bid |
| `/auth/login` | `auth-login.tsx` | Login (email or username + forgot password link) |
| `/auth/register` | `auth-register.tsx` | Register (buyer/seller + domain warning) |
| `/auth/forgot-password` | `auth-forgot-password.tsx` | Request reset link |
| `/auth/reset-password` | `auth-reset-password.tsx` | Set new password via token |
| `/auth/verify-email` | `auth-verify-email.tsx` | Token verification |
| `/profile` | `profile.tsx` | Name + password management |
| `/admin` | `admin.tsx` | Categories tab + Users tab (admin only) |
| `/supplier/dashboard` | `supplier-dashboard.tsx` | Seller dashboard |
| `/supplier/credits` | `supplier-credits.tsx` | Buy credit bundles |

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
