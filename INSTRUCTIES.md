# PrijsMij — Installatiehandleiding

Deze handleiding beschrijft stap voor stap hoe je PrijsMij installeert op een Linux-server (Ubuntu 22.04 of Debian 12). De instructies zijn geschreven zodat een geautomatiseerde omgeving of AI-assistent ze kan uitvoeren.

---

## Inhoudsopgave

1. [Vereisten](#1-vereisten)
2. [Systeemvoorbereiding](#2-systeemvoorbereiding)
3. [Broncode plaatsen](#3-broncode-plaatsen)
4. [Database instellen](#4-database-instellen)
5. [Omgevingsvariabelen instellen](#5-omgevingsvariabelen-instellen)
6. [Afhankelijkheden installeren en bouwen](#6-afhankelijkheden-installeren-en-bouwen)
7. [Database initialiseren](#7-database-initialiseren)
8. [Eerste beheerdersaccount aanmaken](#8-eerste-beheerdersaccount-aanmaken)
9. [API-server starten met PM2](#9-api-server-starten-met-pm2)
10. [Frontend bouwen en plaatsen](#10-frontend-bouwen-en-plaatsen)
11. [Nginx configureren](#11-nginx-configureren)
12. [SSL-certificaat instellen](#12-ssl-certificaat-instellen)
13. [Controleren of alles werkt](#13-controleren-of-alles-werkt)
14. [E-mail configureren (optioneel)](#14-e-mail-configureren-optioneel)
15. [Updates uitrollen](#15-updates-uitrollen)

---

## 1. Vereisten

### Software
- Node.js 20 of hoger
- pnpm 9 of hoger
- PostgreSQL 14 of hoger
- Nginx
- PM2 (Node.js processmanager)
- Certbot (voor HTTPS)
- Git

### Hardware (minimaal)
- 1 GB RAM (2 GB aanbevolen)
- 10 GB schijfruimte
- Linux (Ubuntu 22.04 LTS of Debian 12)

### Netwerk
- Een domeinnaam die wijst naar het IP-adres van de server
- Poorten 80 en 443 open in de firewall

---

## 2. Systeemvoorbereiding

```bash
# Systeem bijwerken
sudo apt update && sudo apt upgrade -y

# Benodigde systeemsoftware installeren
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Firewall instellen
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Node.js 20 installeren via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Node.js versie controleren (moet 20.x of hoger zijn)
node --version

# pnpm installeren
npm install -g pnpm

# pnpm versie controleren
pnpm --version

# PM2 installeren (globaal)
npm install -g pm2

# PostgreSQL installeren
sudo apt install -y postgresql postgresql-contrib

# PostgreSQL starten en inschakelen
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 3. Broncode plaatsen

```bash
# Werkmap aanmaken
sudo mkdir -p /var/www/prijsmij
sudo chown $USER:$USER /var/www/prijsmij

# Optie A: broncode uitpakken vanuit het archief
tar -xzf prijsmij-v0.1.tar.gz -C /var/www/prijsmij

# Optie B: klonen vanuit een Git-repository (indien beschikbaar)
# git clone https://github.com/jouw-repo/prijsmij.git /var/www/prijsmij

cd /var/www/prijsmij
```

---

## 4. Database instellen

```bash
# Inloggen als postgres-gebruiker
sudo -u postgres psql

# Voer de volgende SQL-commando's uit in de psql-prompt:
CREATE DATABASE prijsmij;
CREATE USER prijsmij_user WITH ENCRYPTED PASSWORD 'kies-een-sterk-wachtwoord';
GRANT ALL PRIVILEGES ON DATABASE prijsmij TO prijsmij_user;
# Geef schema-rechten (PostgreSQL 15+)
\c prijsmij
GRANT ALL ON SCHEMA public TO prijsmij_user;
\q
```

---

## 5. Omgevingsvariabelen instellen

Maak een `.env` bestand aan voor de API-server:

```bash
cat > /var/www/prijsmij/artifacts/api-server/.env << 'EOF'
# Database
DATABASE_URL=postgresql://prijsmij_user:kies-een-sterk-wachtwoord@localhost:5432/prijsmij

# JWT-beveiliging — verander dit naar een lange willekeurige tekst (minimaal 32 tekens)
JWT_SECRET=vervang-dit-door-een-lang-willekeurig-geheim-van-minimaal-32-tekens

# URL van de site (voor e-maillinks)
APP_URL=https://jouwdomein.nl

# E-mail (optioneel — zie sectie 14)
# SMTP_HOST=smtp.jouwprovider.nl
# SMTP_PORT=587
# SMTP_USER=noreply@jouwdomein.nl
# SMTP_PASS=jouw-smtp-wachtwoord
# SMTP_FROM=noreply@jouwdomein.nl

# Omgeving
NODE_ENV=production
PORT=8080
EOF
```

> **Belangrijk:** Vervang `kies-een-sterk-wachtwoord` en `vervang-dit-door-een-lang-willekeurig-geheim` door echte waarden.
> Genereer een veilig JWT-geheim met: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

---

## 6. Afhankelijkheden installeren en bouwen

```bash
cd /var/www/prijsmij

# Alle pnpm afhankelijkheden installeren (inclusief alle workspaces)
pnpm install

# Gedeelde bibliotheken bouwen (db, api-spec, api-client, etc.)
pnpm run build 2>/dev/null || true

# API-server bouwen
pnpm --filter @workspace/api-server run build

# Frontend bouwen
pnpm --filter @workspace/marketplace run build
```

---

## 7. Database initialiseren

De database-tabellen worden automatisch aangemaakt via Drizzle ORM:

```bash
cd /var/www/prijsmij

# Laad de DATABASE_URL in de shell
export $(cat artifacts/api-server/.env | grep DATABASE_URL)

# Drizzle ORM: tabellen aanmaken
# (de API-server doet dit automatisch bij de eerste start, of je kunt dit handmatig uitvoeren)
node -e "
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
console.log('Database URL:', process.env.DATABASE_URL ? 'OK' : 'ONTBREEKT');
"
```

**Alternatief — directe SQL-tabellen aanmaken:**

Verbind met de database en voer onderstaande tabellen aan:

```bash
sudo -u postgres psql -d prijsmij << 'SQL'

CREATE TABLE IF NOT EXISTS user_accounts (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'buyer',
  store_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES user_accounts(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC(10,2),
  condition TEXT NOT NULL DEFAULT 'new',
  allow_similar BOOLEAN NOT NULL DEFAULT false,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES requests(id),
  supplier_id INTEGER NOT NULL REFERENCES user_accounts(id),
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  delivery_time TEXT,
  warranty TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  offline_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

INSERT INTO site_settings (offline_mode) VALUES (false) ON CONFLICT DO NOTHING;

SQL
```

**Categorieën vullen (standaard data):**

```bash
cd /var/www/prijsmij
export $(cat artifacts/api-server/.env | grep -v '#' | xargs)
node -r dotenv/config artifacts/api-server/dist/index.mjs &
sleep 3

# Of voer het seed-script uit als dat beschikbaar is:
# pnpm --filter @workspace/scripts run seed
```

---

## 8. Eerste beheerdersaccount aanmaken

```bash
# Genereer een wachtwoord-hash (vervang 'jouw-wachtwoord' door een echt wachtwoord)
HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('jouw-wachtwoord', 10).then(h => console.log(h));" --input-type=module 2>/dev/null || \
  node -e "const b = require('bcryptjs'); b.hash('jouw-wachtwoord', 10, (e,h) => console.log(h));")

# Beheerder invoegen in de database
sudo -u postgres psql -d prijsmij -c "
INSERT INTO user_accounts (role, contact_name, email, username, password_hash, credits, is_admin, email_verified)
VALUES ('buyer', 'Beheerder', 'admin@jouwdomein.nl', 'admin', '$HASH', 0, true, true)
ON CONFLICT (email) DO NOTHING;
"
```

> **Let op:** Vervang `jouw-wachtwoord`, `admin@jouwdomein.nl` door je eigen gegevens.

---

## 9. API-server starten met PM2

```bash
cd /var/www/prijsmij/artifacts/api-server

# Start de server met PM2
pm2 start dist/index.mjs \
  --name "prijsmij-api" \
  --env production \
  --env-file .env

# Controleer of de server draait
pm2 status

# PM2 inschakelen bij serverherstart
pm2 startup
pm2 save

# Test de API
curl http://localhost:8080/api/site-status
# Verwacht: {"offlineMode":false}
```

---

## 10. Frontend bouwen en plaatsen

```bash
# Maak de webroot aan
sudo mkdir -p /var/www/prijsmij-frontend

# Kopieer de gebouwde frontend naar de webroot
sudo cp -r /var/www/prijsmij/artifacts/marketplace/dist/. /var/www/prijsmij-frontend/

# Rechten instellen
sudo chown -R www-data:www-data /var/www/prijsmij-frontend
```

---

## 11. Nginx configureren

```bash
sudo nano /etc/nginx/sites-available/prijsmij
```

Plak de volgende configuratie:

```nginx
server {
    listen 80;
    server_name jouwdomein.nl www.jouwdomein.nl;

    root /var/www/prijsmij-frontend;
    index index.html;

    # Gzip-compressie
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Statische bestanden cachen
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API-verzoeken doorsturen naar Node.js
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # React SPA — alle routes naar index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Configuratie activeren
sudo ln -s /etc/nginx/sites-available/prijsmij /etc/nginx/sites-enabled/

# Standaard site verwijderen (optioneel)
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx-configuratie testen
sudo nginx -t

# Nginx herstarten
sudo systemctl reload nginx
```

---

## 12. SSL-certificaat instellen

```bash
# Vervang jouwdomein.nl door je eigen domeinnaam
sudo certbot --nginx -d jouwdomein.nl -d www.jouwdomein.nl

# Automatische verlenging testen
sudo certbot renew --dry-run
```

---

## 13. Controleren of alles werkt

```bash
# 1. API-server reageert
curl https://jouwdomein.nl/api/site-status
# Verwacht: {"offlineMode":false}

# 2. Frontend laadt
curl -I https://jouwdomein.nl
# Verwacht: HTTP/2 200

# 3. PM2 draait
pm2 status
# Verwacht: prijsmij-api status: online

# 4. Database is bereikbaar
sudo -u postgres psql -d prijsmij -c "SELECT COUNT(*) FROM user_accounts;"

# 5. Inloggen als beheerder testen
curl -X POST https://jouwdomein.nl/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jouwdomein.nl","password":"jouw-wachtwoord"}'
# Verwacht: {"token":"...","user":{"isAdmin":true,...}}
```

---

## 14. E-mail configureren (optioneel)

E-mail wordt gebruikt voor accountverificatie en wachtwoord resetten. Voeg de volgende variabelen toe aan `.env`:

```env
SMTP_HOST=smtp.jouwprovider.nl
SMTP_PORT=587
SMTP_USER=noreply@jouwdomein.nl
SMTP_PASS=jouw-smtp-wachtwoord
SMTP_FROM=noreply@jouwdomein.nl
```

Herstart daarna de API-server:

```bash
pm2 restart prijsmij-api
```

Als `SMTP_HOST` niet is ingesteld, worden verificatielinks gelogd in de console (handig voor testen).

---

## 15. Updates uitrollen

```bash
cd /var/www/prijsmij

# Nieuwe broncode plaatsen (via git pull of nieuw archief uitpakken)
# git pull

# Afhankelijkheden bijwerken
pnpm install

# Bouwen
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/marketplace run build

# Frontend kopiëren
sudo cp -r artifacts/marketplace/dist/. /var/www/prijsmij-frontend/
sudo chown -R www-data:www-data /var/www/prijsmij-frontend

# API-server herstarten
pm2 restart prijsmij-api

# Controleren
pm2 status
curl https://jouwdomein.nl/api/site-status
```

---

## Mappenstructuur na installatie

```
/var/www/
├── prijsmij/                    ← broncode + API-server
│   ├── artifacts/
│   │   ├── api-server/
│   │   │   ├── .env             ← omgevingsvariabelen (GEHEIM)
│   │   │   └── dist/            ← gebouwde API-server
│   │   └── marketplace/
│   │       └── dist/            ← gebouwde frontend (tijdelijk)
│   ├── lib/                     ← gedeelde bibliotheken
│   └── pnpm-workspace.yaml
│
└── prijsmij-frontend/           ← statische frontend bestanden voor Nginx
    ├── index.html
    └── assets/
```

---

## Veelvoorkomende problemen

| Probleem | Oorzaak | Oplossing |
|---|---|---|
| `DATABASE_URL must be set` | `.env` ontbreekt of niet geladen | Controleer of `.env` in `artifacts/api-server/` staat |
| `502 Bad Gateway` | API-server draait niet | `pm2 status` en `pm2 logs prijsmij-api` |
| Witte pagina frontend | Vite `base` URL verkeerd | Controleer `vite.config.ts` — `base: '/'` |
| Inloggen mislukt | Verkeerd wachtwoord-hash | Hermaak de hash via `bcryptjs` (zie stap 8) |
| E-mail wordt niet verstuurd | SMTP niet geconfigureerd | Voeg SMTP-variabelen toe aan `.env` |
| Categorieën leeg | Geen seed-data | Voer het seed-script uit of voeg categorieën toe via beheerderspaneel |
