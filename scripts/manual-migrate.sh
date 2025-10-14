#!/bin/bash

# Script pour exécuter les migrations manuellement avec psql
# Usage: ./scripts/manual-migrate.sh

set -e

echo "🚀 Migration de la base de données Fatimmo"
echo "=========================================="

# URL de connexion PostgreSQL
DB_URL="postgresql://postgres.pwpjcjxosjgdkcvantoo:Mandriva123.@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

# Vérifier que psql est installé
if ! command -v psql &> /dev/null; then
    echo "❌ psql n'est pas installé!"
    echo "Installation:"
    echo "  Ubuntu/Debian: sudo apt install postgresql-client"
    echo "  macOS: brew install postgresql"
    exit 1
fi

echo ""
echo "📝 Migration 1/3: Création du schéma properties..."
psql "$DB_URL" -f database/migrations/001_properties_schema.sql
echo "✅ Schéma créé"

echo ""
echo "📝 Migration 2/3: Configuration RLS..."
psql "$DB_URL" -f database/migrations/002_rls_policies.sql
echo "✅ RLS configuré"

echo ""
echo "📝 Migration 3/3: Ajustement quotas admin..."
psql "$DB_URL" -f database/migrations/003_admin_quota.sql
echo "✅ Quotas ajustés"

echo ""
echo "=========================================="
echo "🎉 Migrations terminées avec succès!"
echo ""
echo "Vérification:"
psql "$DB_URL" -c "SELECT COUNT(*) as tables_count FROM information_schema.tables WHERE table_name = 'properties';"
