# Changelog

## v0.1.0 — 27 maart 2026

Eerste stabiele versie van PrijsMij.

### Functionaliteit
- **Authenticatie** — registreren, inloggen, wachtwoord vergeten/resetten, e-mailverificatie
- **Rollen** — koper, verkoper, beheerder
- **Uitvragen** — kopers plaatsen gratis productuitvragen met vervaldatum en categoriekeuze
- **Biedingen** — verkopers bieden via het Connectie-systeem (credits)
- **Categorieën** — beheerbaar via het beheerderspaneel (naam, icoon, beschrijving, actief/inactief)
- **Beheerderspaneel** — tabbladen voor Categorieën, Gebruikers en Instellingen
- **Gebruikersbeheer** — zoeken/filteren, paginering (25/50/100/250), CSV-export (max 200 rijen)
- **Offline-modus** — beheerder kan de site vergrendelen voor bezoekers
- **Meertaligheid** — Nederlands, Engels, Duits, Frans (i18n)
- **Profiel** — gebruiker kan naam, wachtwoord en e-mail beheren
- **Verkopersdashboard** — overzicht uitvragen, credits kopen

### Technisch
- Monorepo: pnpm workspaces
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + Drizzle ORM
- Database: PostgreSQL
