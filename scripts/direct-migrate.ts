/**
 * Script de migration direct via SQL brut
 * Utilise l'API Supabase pour exécuter du SQL
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function executeSql(sql: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ sql_query: sql })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HTTP ${response.status}: ${error}`)
  }

  return response.json()
}

async function runMigration() {
  console.log('🚀 Migration directe via API Supabase\n')

  try {
    // Migration 1: Schema
    console.log('📝 Migration 1/3: Création du schéma...')
    const schema = readFileSync(
      resolve(__dirname, '../database/migrations/001_properties_schema.sql'),
      'utf-8'
    )

    try {
      await executeSql(schema)
      console.log('✅ Schéma créé avec succès\n')
    } catch (err: any) {
      console.error('❌ Erreur schéma:', err.message, '\n')
    }

    // Migration 2: RLS
    console.log('📝 Migration 2/3: Configuration RLS...')
    const rls = readFileSync(
      resolve(__dirname, '../database/migrations/002_rls_policies.sql'),
      'utf-8'
    )

    try {
      await executeSql(rls)
      console.log('✅ RLS configuré avec succès\n')
    } catch (err: any) {
      console.error('❌ Erreur RLS:', err.message, '\n')
    }

    // Migration 3: Admin quota
    console.log('📝 Migration 3/3: Ajustement quotas admin...')
    const quota = readFileSync(
      resolve(__dirname, '../database/migrations/003_admin_quota.sql'),
      'utf-8'
    )

    try {
      await executeSql(quota)
      console.log('✅ Quotas ajustés avec succès\n')
    } catch (err: any) {
      console.error('❌ Erreur quotas:', err.message, '\n')
    }

    console.log('🎉 Migrations terminées!')

  } catch (error: any) {
    console.error('💥 Erreur fatale:', error.message)
    process.exit(1)
  }
}

runMigration()
