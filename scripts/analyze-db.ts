import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Assurez-vous que .env.local contient:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function analyzeDatabase() {
  console.log('🔍 Analyse de la base de données Fatimmo...\n')
  console.log('='  .repeat(60))

  try {
    // 1. Analyser la table properties
    console.log('\n📋 TABLE: properties')
    console.log('-'.repeat(60))

    const { data: properties, error: propError, count: propCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .limit(1)

    if (propError) {
      console.log('❌ Erreur:', propError.message)
    } else {
      console.log(`✅ Nombre total d'enregistrements: ${propCount}`)

      if (properties && properties.length > 0) {
        console.log('\n📊 Structure des colonnes:')
        const columns = Object.keys(properties[0])
        columns.forEach(col => {
          const value = properties[0][col]
          const type = Array.isArray(value) ? 'array' : typeof value
          console.log(`  - ${col}: ${type}`)
        })

        console.log('\n📝 Exemple de données:')
        console.log(JSON.stringify(properties[0], null, 2))
      } else {
        console.log('⚠️  Aucune donnée trouvée dans la table properties')
      }
    }

    // 2. Analyser la table users
    console.log('\n\n📋 TABLE: users')
    console.log('-'.repeat(60))

    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .limit(1)

    if (usersError) {
      console.log('❌ Erreur:', usersError.message)
    } else {
      console.log(`✅ Nombre total d'utilisateurs: ${usersCount}`)

      if (users && users.length > 0) {
        console.log('\n📊 Structure des colonnes:')
        const columns = Object.keys(users[0])
        columns.forEach(col => {
          const value = users[0][col]
          const type = Array.isArray(value) ? 'array' : typeof value
          console.log(`  - ${col}: ${type}`)
        })

        console.log('\n📝 Exemple de données (sans mot de passe):')
        const { password, ...userSafe } = users[0] as any
        console.log(JSON.stringify(userSafe, null, 2))
      } else {
        console.log('⚠️  Aucune donnée trouvée dans la table users')
      }
    }

    // 3. Statistiques sur les propriétés
    console.log('\n\n📊 STATISTIQUES PROPERTIES')
    console.log('-'.repeat(60))

    // Par type de transaction
    const { data: byTransaction } = await supabase
      .from('properties')
      .select('transaction_type')

    if (byTransaction) {
      const stats = byTransaction.reduce((acc: any, prop: any) => {
        acc[prop.transaction_type] = (acc[prop.transaction_type] || 0) + 1
        return acc
      }, {})
      console.log('Par type de transaction:')
      Object.entries(stats).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`)
      })
    }

    // Par type de propriété
    const { data: byType } = await supabase
      .from('properties')
      .select('property_type')

    if (byType) {
      const stats = byType.reduce((acc: any, prop: any) => {
        acc[prop.property_type] = (acc[prop.property_type] || 0) + 1
        return acc
      }, {})
      console.log('\nPar type de propriété:')
      Object.entries(stats).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`)
      })
    }

    // Par ville
    const { data: byCity } = await supabase
      .from('properties')
      .select('city')

    if (byCity) {
      const stats = byCity.reduce((acc: any, prop: any) => {
        acc[prop.city] = (acc[prop.city] || 0) + 1
        return acc
      }, {})
      console.log('\nPar ville:')
      Object.entries(stats).forEach(([city, count]) => {
        console.log(`  - ${city}: ${count}`)
      })
    }

    // 4. Recommandations pour optimisation terrains
    console.log('\n\n💡 RECOMMANDATIONS POUR VENTE DE TERRAINS')
    console.log('-'.repeat(60))

    if (properties && properties.length > 0) {
      const prop = properties[0]
      const recommendations = []

      // Vérifier les champs manquants pour terrains
      const terrainFields = {
        'title_deed_number': 'Numéro Titre Foncier (TF)',
        'plot_number': 'Numéro de parcelle',
        'cadastral_reference': 'Référence cadastrale',
        'is_titled': 'Terrain titré',
        'is_bounded': 'Terrain borné',
        'is_serviced': 'Terrain viabilisé (eau, électricité)',
        'latitude': 'Latitude GPS',
        'longitude': 'Longitude GPS',
        'zoning': 'Zonage (résidentiel, commercial)',
        'slope': 'Pente du terrain',
        'soil_type': 'Type de sol',
        'access_road': 'Accès routier',
        'distance_to_main_road': 'Distance route principale',
        'nearby_amenities': 'Commodités à proximité (array)',
        'documents': 'Documents (TF, plans, etc.) (array)',
        'video_url': 'URL vidéo drone',
        'virtual_tour_url': 'Visite virtuelle 360°',
        'payment_plans': 'Plans de paiement disponibles (array)',
        'discount_percentage': 'Remise disponible',
        'featured': 'Terrain en vedette',
        'views_count': 'Nombre de vues',
        'inquiries_count': 'Nombre de demandes',
        'seo_title': 'Titre SEO',
        'seo_description': 'Description SEO',
        'seo_keywords': 'Mots-clés SEO (array)'
      }

      Object.entries(terrainFields).forEach(([field, description]) => {
        if (!(field in prop)) {
          recommendations.push(`❌ Ajouter: ${field} (${description})`)
        }
      })

      if (recommendations.length > 0) {
        console.log('\n🔧 Champs à ajouter à la table properties:')
        recommendations.forEach(rec => console.log(`  ${rec}`))
      } else {
        console.log('✅ Tous les champs recommandés sont présents!')
      }
    }

    // 5. Recommandations SEO
    console.log('\n\n🔍 RECOMMANDATIONS SEO')
    console.log('-'.repeat(60))
    console.log('✓ Créer index sur: city, property_type, transaction_type, price')
    console.log('✓ Ajouter full-text search sur: title, description')
    console.log('✓ Créer slug SEO-friendly: /terrains/[ville]/[id]-[slug]')
    console.log('✓ Ajouter sitemap.xml automatique')
    console.log('✓ Implémenter Schema.org RealEstateListing')

    console.log('\n\n' + '='.repeat(60))
    console.log('✅ Analyse terminée!')

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error)
  }
}

// Exécuter l'analyse
analyzeDatabase()
