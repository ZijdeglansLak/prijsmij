# PrijsMij — SEO & Google Ads Campagnegids

> **Doel:** Maximale zichtbaarheid op Google bij de lancering van PrijsMij, de omgekeerde marktplaats voor Nederland.

---

## 1. Technische SEO — checklist voor lancering

Onderstaande punten zijn deels al geïmplementeerd in de code; de rest moet je na deployment instellen.

### 1.1 Wat al in de code zit (v4.36)

| Element | Waarde |
|---|---|
| `<html lang="nl">` | ✅ Correct voor NL-markt |
| `<title>` | PrijsMij – Kopers plaatsen een uitvraag, winkeliers bieden |
| `<meta name="description">` | 155 tekens, actief geschreven, bevat keyword |
| `<link rel="canonical">` | https://prijsmij.nl/ |
| Open Graph tags | ✅ og:title, og:description, og:image, og:locale nl_NL |
| Twitter Card | ✅ summary_large_image |
| JSON-LD WebSite + SearchAction | ✅ Rich result mogelijk in Google |
| JSON-LD Organization | ✅ Kennispaneel in Google |

### 1.2 Wat je na deployment instelt

**Google Search Console**
1. Ga naar [search.google.com/search-console](https://search.google.com/search-console)
2. Voeg eigendom toe: `https://prijsmij.nl`
3. Verifieer via DNS TXT-record bij je domeinregistrar
4. Dien sitemap in: `https://prijsmij.nl/sitemap.xml`

**Sitemap aanmaken**
Voeg een statische `sitemap.xml` toe in `artifacts/marketplace/public/`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://prijsmij.nl/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://prijsmij.nl/requests</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>https://prijsmij.nl/auth/register</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://prijsmij.nl/supplier/register</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>
```

**robots.txt**
Voeg toe in `artifacts/marketplace/public/`:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /profile
Disallow: /supplier/dashboard
Sitemap: https://prijsmij.nl/sitemap.xml
```

**OG-afbeelding**
Maak een `og-image.png` van 1200×630 px met de PrijsMij branding en sla op in `artifacts/marketplace/public/`.

### 1.3 Core Web Vitals (PageSpeed)
Na livegang meten via [pagespeed.web.dev](https://pagespeed.web.dev/). Streef naar:
- LCP < 2,5 s (lettertypes zijn al gepreconnect ✅)
- CLS < 0,1 (vermijd layout shifts bij laden)
- FID/INP < 200 ms

---

## 2. Zoekwoorden strategie

### Kopers (primaire doelgroep)
| Zoekwoord | Intentie | Volume (NL) |
|---|---|---|
| beste prijs vinden | commercieel | hoog |
| uitvraag plaatsen product | transactioneel | middel |
| vergelijk aanbod winkeliers | commercieel | middel |
| omgekeerde marktplaats | informatief | laag/groeiend |
| prijs opvragen meerdere winkels | transactioneel | middel |
| aanvraag plaatsen elektronica | transactioneel | middel |

### Winkeliers (secundaire doelgroep)
| Zoekwoord | Intentie | Volume (NL) |
|---|---|---|
| nieuwe klanten vinden webshop | commercieel | middel |
| meer verkopen lokale winkel | informatief | middel |
| leads kopen online retail | transactioneel | laag |
| platform voor winkeliers Nederland | informatief | laag |

---

## 3. Google Ads — campagneopzet

### 3.1 Accountstructuur

```
Google Ads Account
├── Campagne 1: Kopers — Zoeknetwerk
│   ├── Advertentiegroep A: Omgekeerde marktplaats
│   ├── Advertentiegroep B: Beste prijs zoeken
│   └── Advertentiegroep C: Uitvraag plaatsen
│
├── Campagne 2: Winkeliers — Zoeknetwerk
│   ├── Advertentiegroep A: Nieuwe klanten
│   └── Advertentiegroep B: Leads platform
│
└── Campagne 3: Remarketing — Display
    └── Advertentiegroep A: Website bezoekers (geen conversie)
```

### 3.2 Campagne 1: Kopers (Zoeknetwerk)

**Instellingen**
- Campagnetype: Zoeknetwerk
- Doel: Websiteverkeer → Conversies (registratie)
- Biedstrategie: **Conversies maximaliseren** (na 30+ conversies: Doel-CPA)
- Budget: € 15–25 /dag om te beginnen
- Locatie: Nederland
- Taal: Nederlands
- Netwerken: ✅ Zoeken | ❌ Display | ❌ Zoekpartners (begin zonder)
- Rotatieperiode advertenties: Geoptimaliseerd

**Conversieactie instellen in Google Ads**
1. Tools & instellingen → Conversies → Nieuwe conversieactie
2. Type: Website
3. Naam: `Koper registratie`
4. Waarde: € 5,00 (geschatte waarde nieuwe koper)
5. **Conversiepagina:** `https://prijsmij.nl/auth/register` (bevestigingspagina na registratie)
6. Tag plaatsen via Google Tag Manager op de bedanktpagina

**Advertentiegroep A: Omgekeerde marktplaats**

Zoekwoorden (breed gewijzigd of exact):
```
[omgekeerde marktplaats]
[uitvraag plaatsen en bieden]
+omgekeerde +marktplaats +nederland
+uitvraag +plaatsen +winkeliers
```

Responsieve zoekadvertentie:
- Kopregel 1: `Jij Vraagt, Winkeliers Bieden`
- Kopregel 2: `Gratis Uitvraag Plaatsen`
- Kopregel 3: `Ontvang Scherpe Biedingen`
- Kopregel 4: `De Nieuwe Manier van Kopen`
- Kopregel 5: `Altijd de Scherpste Prijs`
- Beschrijving 1: `Zet jij de spelregels. Plaats gratis je uitvraag en ontvang directe biedingen van lokale winkeliers. Kies zelf het beste aanbod.`
- Beschrijving 2: `Geen gedoe met vergelijkingssites. Op PrijsMij bieden winkeliers op jóuw uitvraag — jij kiest wie wint.`
- **Weergave-URL:** `prijsmij.nl`
- **Bestemmings-URL (checkout):** `https://prijsmij.nl/auth/register`

**Advertentie-extensies**
- Sitelinks:
  - `Hoe werkt het` → `https://prijsmij.nl/`
  - `Uitvraag plaatsen` → `https://prijsmij.nl/request/new`
  - `Bekijk uitvragen` → `https://prijsmij.nl/requests`
  - `Winkelier worden` → `https://prijsmij.nl/supplier/register`
- Onderteksten: `Gratis registreren` | `Geen verplichtingen` | `100% NL winkeliers`
- Oproepextensie: je telefoonnummer (optioneel)
- Structured Snippets (Soorten): `Elektronica · Meubels · Sport · Mode · Doe-het-zelf`

**Advertentiegroep B: Beste prijs zoeken**

Zoekwoorden:
```
[beste prijs vinden]
+beste +prijs +kopen +nederland
+prijs +vergelijken +winkeliers
"goedkoopste prijs vinden"
```

Responsieve advertentie:
- Kopregel 1: `Vind de Beste Prijs in NL`
- Kopregel 2: `Winkeliers Concurreren Voor Jou`
- Kopregel 3: `Gratis — Geen Verplichtingen`
- Beschrijving 1: `Op PrijsMij bieden winkeliers op jouw aanvraag. Jij kiest de scherpste prijs. Volledig gratis voor kopers.`
- **Bestemmings-URL:** `https://prijsmij.nl/auth/register`

**Advertentiegroep C: Uitvraag plaatsen**

Zoekwoorden:
```
[uitvraag plaatsen]
+aanvraag +plaatsen +product
+offerte +aanvragen +winkels
```

Responsieve advertentie:
- Kopregel 1: `Uitvraag Plaatsen in 2 Minuten`
- Kopregel 2: `Meerdere Biedingen, Één Keuze`
- Kopregel 3: `Volledig Gratis voor Kopers`
- **Bestemmings-URL:** `https://prijsmij.nl/request/new`

---

### 3.3 Campagne 2: Winkeliers (Zoeknetwerk)

**Instellingen**
- Budget: € 10 /dag
- Biedstrategie: Klikken maximaliseren (begin), daarna Conversies
- **Conversiepagina (checkout winkeliers):** `https://prijsmij.nl/supplier/credits`
- Conversienaam: `Winkeliers creditaankoop`
- Conversiewaarde: € 15,00 (gemiddelde creditaankoop)

**Zoekwoorden**
```
[nieuwe klanten vinden als winkelier]
+leads +kopen +retail +nederland
+meer +verkopen +online
+klanten +werven +lokale +winkel
```

Responsieve advertentie:
- Kopregel 1: `Nieuwe Klanten voor Jouw Winkel`
- Kopregel 2: `Kopers Zoeken Jouw Product Nu`
- Kopregel 3: `Alleen Betalen per Contact`
- Beschrijving 1: `Op PrijsMij plaatsen kopers dagelijks uitvragen voor producten die jij verkoopt. Bied en win de opdracht. Betaal alleen voor echte contacten.`
- Beschrijving 2: `Geen abonnement. Geen risico. Koop credits en reageer direct op uitvragen die bij jouw winkel passen.`
- **Bestemmings-URL (checkout):** `https://prijsmij.nl/supplier/register`

---

### 3.4 Campagne 3: Remarketing (Display)

**Doelgroepen**
- Websitebezoekers (alle) — laatste 30 dagen
- Bezoekers `/requests` zonder registratie
- Bezoekers `/auth/register` zonder voltooien

**Advertentiemateriaal**
- Responsieve displayadvertentie:
  - Koptekst: `Ben je vergeten te registreren?`
  - Beschrijving: `Jouw gratis uitvraag wacht. Winkeliers staan klaar om te bieden.`
  - Logo: PrijsMij favicon
  - Afbeelding: screenshot van de uitvragenpagina
  - **Bestemmings-URL:** `https://prijsmij.nl/auth/register`

**Frequentiebegrenzing:** max. 3× per dag per gebruiker

---

## 4. Conversiemeting instellen

### Stap-voor-stap via Google Tag Manager

1. **Maak een GTM-account** op [tagmanager.google.com](https://tagmanager.google.com)
2. Voeg de GTM-snippets toe aan `artifacts/marketplace/index.html` (head + body)
3. **Tag: Google Ads — Koper registratie**
   - Type: Google Ads conversietracering
   - Conversie-ID: (uit je Google Ads account)
   - Trigger: Paginavisualisatie op `/auth/verify-email` (bevestigingspagina)
4. **Tag: Google Ads — Winkeliers creditaankoop**
   - Trigger: Paginavisualisatie op `/betaling-geslaagd`
5. **Tag: GA4**
   - Meetings-ID: uit Google Analytics 4
   - Trigger: Alle pagina's

### Koppelingen activeren
- Google Ads ↔ Google Analytics 4 koppelen (via Ads: Tools → Koppelingen)
- Conversies importeren uit GA4 in Ads (voor betere attributie)

---

## 5. Budget- en biedstrategie planning

| Fase | Duur | Budget/dag | Biedstrategie | KPI |
|---|---|---|---|---|
| Leren | Week 1–3 | € 20 totaal | Klikken maximaliseren | CPC < € 0,80 |
| Optimaliseren | Week 4–8 | € 25–35 | Conversies maximaliseren | CPA < € 4 |
| Schalen | Maand 3+ | Op basis resultaat | Doel-CPA of ROAS | CPA stabiel |

**Verwachte metrics bij lancering (schatting NL-markt)**
- CPC kopers: € 0,40–0,90
- Conversieratio registratie: 8–15%
- Kosten per nieuwe koper: € 3–8
- CPC winkeliers: € 0,80–1,50
- Conversieratio creditaankoop: 3–7%
- Kosten per betalende winkelier: € 15–35

---

## 6. Negatieve zoekwoorden (verplicht!)

Voeg toe aan beide campagnes om irrelevant verkeer te blokkeren:

```
gratis
marktplaats.nl
tweedehands
occasion
tweedehands kopen
vacature
cursus
werkzoekende
```

---

## 7. Lanceringsplan (week 1)

| Dag | Actie |
|---|---|
| D-7 | Google Ads account aanmaken, conversietags live, GTM publiceren |
| D-7 | Search Console verifiëren, sitemap indienen |
| D-3 | Campagnes aanmaken, in concept zetten, laten reviewen door Google |
| D-1 | Campagnes live zetten (Google keurt binnen 24u goed) |
| D+3 | Eerste data bekijken: zoektermen rapport, kwaliteitsscore per zoekwoord |
| D+7 | Negatieve zoekwoorden verfijnen op basis van zoektermenrapport |
| D+14 | Biedstrategie beoordelen, budget bijstellen |

---

## 8. Handige links & checkoutlinks

| Doel | URL |
|---|---|
| Koper registreren | https://prijsmij.nl/auth/register |
| Koper inloggen | https://prijsmij.nl/auth/login |
| Uitvraag plaatsen | https://prijsmij.nl/request/new |
| Alle uitvragen bekijken | https://prijsmij.nl/requests |
| Winkelier registreren | https://prijsmij.nl/supplier/register |
| **Credits kopen (checkout)** | **https://prijsmij.nl/supplier/credits** |
| Betaling geslaagd | https://prijsmij.nl/betaling-geslaagd |

---

## 9. Google Ads — snelkoppeling

Direct starten: [ads.google.com](https://ads.google.com)

> **Tip:** Kies bij het aanmaken van je account voor *Expertmodus* (onderaan op de welkomstpagina). Zo heb je volledige controle over campagnestructuur, biedstrategieën en zoekwoorden. De automatische "Slimme campagne" is niet geschikt voor deze aanpak.

---

*Document gegenereerd voor PrijsMij v4.36 — April 2025*
