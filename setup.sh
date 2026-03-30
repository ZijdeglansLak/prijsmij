#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     PrijsMij — Installatie setup     ║"
echo "╚══════════════════════════════════════╝"
echo ""

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is niet ingesteld."
  echo "   Stel de variabele in:"
  echo "   export DATABASE_URL=postgresql://user:pass@host:5432/dbname"
  exit 1
fi

echo "📦 Pakketten installeren..."
pnpm install

echo ""
echo "🗄️  Database-tabellen aanmaken..."
pnpm --filter @workspace/db run push --force

echo ""
echo "🌱 Standaarddata seeden (admin, categorieën, demo-data)..."
pnpm --filter @workspace/scripts run seed

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ Setup klaar!                                     ║"
echo "║                                                      ║"
echo "║  Admin:    admin@prijsmij.nl / welkom12345           ║"
echo "║  ⚠️  Wijzig dit wachtwoord na eerste inlog!          ║"
echo "║                                                      ║"
echo "║  Starten:                                            ║"
echo "║    pnpm --filter @workspace/api-server run dev       ║"
echo "║    pnpm --filter @workspace/marketplace run dev      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
