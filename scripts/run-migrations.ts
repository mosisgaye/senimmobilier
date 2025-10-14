import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  process.exit(1)
}

// Créer un client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runMigrations() {
  console.log('🚀 Démarrage des migrations...\n')
  console.log('='  .repeat(60))

  const migrations = [
    {
      name: '001_properties_schema.sql',
      description: 'Création du schéma properties optimisé'
    },
    {
      name: '002_rls_policies.sql',
      description: 'Configuration des politiques RLS'
    },
    {
      name: '003_admin_quota.sql',
      description: 'Ajustement des quotas admin'
    }
  ]

  for (const migration of migrations) {
    console.log(`\n📝 Migration: ${migration.name}`)
    console.log(`   ${migration.description}`)
    console.log('-'.repeat(60))

    try {
      const sqlPath = resolve(__dirname, `../database/migrations/${migration.name}`)
      const sqlContent = readFileSync(sqlPath, 'utf-8')

      // Supprimer les commentaires SQL pour compatibilité
      const cleanSql = sqlContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')

      // Diviser en commandes individuelles
      const commands = cleanSql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0)

      console.log(`   ⏳ Exécution de ${commands.length} commandes SQL...`)

      let successCount = 0
      let errorCount = 0

      for (const cmd of commands) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_query: cmd })

          if (error) {
            // Ignorer certaines erreurs connues
            if (
              error.message.includes('already exists') ||
              error.message.includes('does not exist')
            ) {
              console.log(`   ⚠️  Ignoré: ${error.message.substring(0, 80)}...`)
            } else {
              console.error(`   ❌ Erreur: ${error.message}`)
              errorCount++
            }
          } else {
            successCount++
          }
        } catch (err: any) {
          console.error(`   ❌ Exception: ${err.message}`)
          errorCount++
        }
      }

      if (errorCount === 0) {
        console.log(`   ✅ Migration réussie (${successCount} commandes)`)
      } else {
        console.log(`   ⚠️  Migration partielle (${successCount} réussies, ${errorCount} erreurs)`)
      }

    } catch (error: any) {
      console.error(`   ❌ Erreur lecture fichier: ${error.message}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Migrations terminées!\n')
}

runMigrations().catch(console.error)
