import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Données d'exemple pour les propriétés au Sénégal
const sampleProperties = [
  {
    title: 'Terrain Titré de 500m² à Almadies',
    description: 'Magnifique terrain titré situé dans le prestigieux quartier des Almadies. Idéal pour construction de villa moderne. Zone résidentielle calme et sécurisée avec vue sur l\'océan Atlantique.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 75000000, // 75 millions FCFA
    surface_area: 500,
    city: 'Dakar',
    district: 'Almadies',
    latitude: 14.7392,
    longitude: -17.5022,
    is_titled: true,
    is_bounded: true,
    is_serviced: true,
    title_deed_number: 'TF-DAK-12345',
    soil_type: 'sablonneux',
    zoning: 'residential',
    slope: 'flat',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['École', 'Hôpital', 'Supermarché', 'Mosquée'],
    seo_keywords: ['terrain almadies', 'terrain titré dakar', 'vente terrain sénégal'],
    payment_plans: [
      { name: 'Comptant', discount: 5, description: '5% de réduction' },
      { name: '3 mois', months: 3, initial_payment: 30, description: '30% initial, solde sur 3 mois' }
    ]
  },
  {
    title: 'Terrain 300m² à Mbour Proche Mer',
    description: 'Terrain viabilisé à proximité immédiate de la plage de Mbour. Parfait pour investissement locatif ou résidence secondaire. Accès direct à la mer et toutes commodités à proximité.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 18000000, // 18 millions FCFA
    surface_area: 300,
    city: 'Mbour',
    district: 'Mbour Centre',
    latitude: 14.4196,
    longitude: -16.9605,
    is_titled: false,
    is_bounded: true,
    is_serviced: true,
    soil_type: 'sablonneux',
    zoning: 'residential',
    slope: 'flat',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['Plage', 'Restaurant', 'Marché', 'École'],
    seo_keywords: ['terrain mbour', 'terrain mer sénégal', 'investissement immobilier mbour'],
    payment_plans: [
      { name: 'Comptant', discount: 3, description: '3% de réduction' },
      { name: '6 mois', months: 6, initial_payment: 25, description: '25% initial, solde sur 6 mois' }
    ]
  },
  {
    title: 'Grand Terrain 1000m² à Saly',
    description: 'Vaste terrain dans la zone touristique de Saly. Idéal pour projet hôtelier ou résidence de luxe. Situé dans un environnement calme avec accès facile aux plages et infrastructures touristiques.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 50000000, // 50 millions FCFA
    surface_area: 1000,
    city: 'Saly',
    district: 'Saly Portudal',
    latitude: 14.4520,
    longitude: -17.0324,
    is_titled: true,
    is_bounded: true,
    is_serviced: true,
    title_deed_number: 'TF-SALY-67890',
    soil_type: 'sablonneux',
    zoning: 'commercial',
    slope: 'flat',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['Plage', 'Hôtel', 'Golf', 'Restaurant', 'Centre commercial'],
    seo_keywords: ['terrain saly', 'investissement touristique', 'terrain commercial sénégal'],
    payment_plans: [
      { name: 'Comptant', discount: 7, description: '7% de réduction' },
      { name: '12 mois', months: 12, initial_payment: 40, description: '40% initial, solde sur 12 mois' }
    ]
  },
  {
    title: 'Terrain 200m² Résidentiel Pikine',
    description: 'Terrain borné dans un quartier résidentiel en plein développement à Pikine. Bon rapport qualité-prix pour première acquisition. Accès facile et quartier dynamique avec toutes commodités.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 8000000, // 8 millions FCFA
    surface_area: 200,
    city: 'Pikine',
    district: 'Pikine Guédiawaye',
    latitude: 14.7547,
    longitude: -17.3986,
    is_titled: false,
    is_bounded: true,
    is_serviced: false,
    soil_type: 'argileux',
    zoning: 'residential',
    slope: 'flat',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['École', 'Marché', 'Mosquée', 'Transport public'],
    seo_keywords: ['terrain pikine', 'terrain pas cher dakar', 'première acquisition'],
    payment_plans: [
      { name: 'Comptant', discount: 2, description: '2% de réduction' },
      { name: '4 mois', months: 4, initial_payment: 30, description: '30% initial, solde sur 4 mois' }
    ]
  },
  {
    title: 'Terrain Agricole 2 Hectares Thiès',
    description: 'Grande parcelle agricole fertile située à Thiès. Parfait pour exploitation maraîchère ou agricole. Sol riche et accès à l\'eau. Idéal pour investissement agricole rentable.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 35000000, // 35 millions FCFA
    surface_area: 20000, // 2 hectares
    city: 'Thiès',
    district: 'Thiès Nord',
    latitude: 14.7889,
    longitude: -16.9324,
    is_titled: true,
    is_bounded: true,
    is_serviced: false,
    title_deed_number: 'TF-THIES-11223',
    soil_type: 'argileux',
    zoning: 'agricultural',
    slope: 'gentle',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['Point d\'eau', 'Route goudronnée', 'Village'],
    seo_keywords: ['terrain agricole thiès', 'terre agricole sénégal', 'investissement agricole'],
    payment_plans: [
      { name: 'Comptant', discount: 5, description: '5% de réduction' },
      { name: '18 mois', months: 18, initial_payment: 35, description: '35% initial, solde sur 18 mois' }
    ]
  },
  {
    title: 'Terrain Commercial 400m² Rufisque',
    description: 'Emplacement stratégique pour commerce à Rufisque. Situé sur axe passant avec forte visibilité. Idéal pour boutique, restaurant ou bureau. Zone commerciale en pleine expansion.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 22000000, // 22 millions FCFA
    surface_area: 400,
    city: 'Rufisque',
    district: 'Rufisque Centre',
    latitude: 14.7167,
    longitude: -17.2667,
    is_titled: true,
    is_bounded: true,
    is_serviced: true,
    title_deed_number: 'TF-RUF-33445',
    soil_type: 'sablonneux',
    zoning: 'commercial',
    slope: 'flat',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['Banque', 'Station service', 'Marché', 'Transport public'],
    seo_keywords: ['terrain commercial rufisque', 'local commercial sénégal', 'investissement commercial'],
    payment_plans: [
      { name: 'Comptant', discount: 4, description: '4% de réduction' },
      { name: '8 mois', months: 8, initial_payment: 35, description: '35% initial, solde sur 8 mois' }
    ]
  },
  {
    title: 'Terrain de Luxe 800m² Ngor',
    description: 'Terrain d\'exception dans le quartier prisé de Ngor. Vue panoramique sur l\'océan et île de Ngor. Zone résidentielle haut standing avec toutes commodités de luxe à proximité.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 120000000, // 120 millions FCFA
    surface_area: 800,
    city: 'Dakar',
    district: 'Ngor',
    latitude: 14.7503,
    longitude: -17.5153,
    is_titled: true,
    is_bounded: true,
    is_serviced: true,
    title_deed_number: 'TF-NGOR-55667',
    soil_type: 'rocheux',
    zoning: 'residential',
    slope: 'moderate',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['Plage', 'Restaurant gastronomique', 'Hôtel 5 étoiles', 'Centre de loisirs'],
    seo_keywords: ['terrain luxe ngor', 'terrain vue mer dakar', 'immobilier prestige sénégal'],
    payment_plans: [
      { name: 'Comptant', discount: 8, description: '8% de réduction' },
      { name: '24 mois', months: 24, initial_payment: 50, description: '50% initial, solde sur 24 mois' }
    ]
  },
  {
    title: 'Terrain Résidentiel 350m² Toubab Dialaw',
    description: 'Charmant terrain dans le village artistique de Toubab Dialaw. Ambiance calme et authentique à 45km de Dakar. Parfait pour résidence nature ou projet éco-touristique.',
    property_type: 'land',
    transaction_type: 'sale',
    price: 12000000, // 12 millions FCFA
    surface_area: 350,
    city: 'Toubab Dialaw',
    district: 'Toubab Dialaw',
    latitude: 14.5833,
    longitude: -17.0833,
    is_titled: false,
    is_bounded: true,
    is_serviced: false,
    soil_type: 'sablonneux',
    zoning: 'residential',
    slope: 'flat',
    status: 'active',
    is_available: true,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
    ],
    nearby_amenities: ['Plage', 'Artisanat', 'Restaurant', 'Nature'],
    seo_keywords: ['terrain toubab dialaw', 'terrain nature sénégal', 'éco-tourisme'],
    payment_plans: [
      { name: 'Comptant', discount: 3, description: '3% de réduction' },
      { name: '6 mois', months: 6, initial_payment: 25, description: '25% initial, solde sur 6 mois' }
    ]
  }
]

async function insertSampleProperties() {
  console.log('🚀 Début de l\'insertion des propriétés d\'exemple...\n')

  // Vérifier la connexion
  const { data: testData, error: testError } = await supabase
    .from('properties')
    .select('count')
    .limit(1)

  if (testError) {
    console.error('❌ Erreur de connexion à la base de données:', testError.message)
    console.log('\n💡 Vérifiez que:')
    console.log('   1. Les migrations ont été exécutées')
    console.log('   2. Les variables d\'environnement sont correctes')
    console.log('   3. Vous avez les permissions nécessaires')
    process.exit(1)
  }

  console.log('✅ Connexion à la base de données réussie\n')

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < sampleProperties.length; i++) {
    const property = sampleProperties[i]
    console.log(`📝 [${i + 1}/${sampleProperties.length}] Insertion: ${property.title}`)

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()
        .single()

      if (error) {
        console.error(`   ❌ Erreur: ${error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ Succès - ID: ${data.id}`)
        console.log(`   🔗 Slug: ${data.slug}`)
        successCount++
      }
    } catch (err: any) {
      console.error(`   ❌ Exception: ${err.message}`)
      errorCount++
    }

    console.log('') // Ligne vide pour lisibilité
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RÉSUMÉ')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Réussies: ${successCount}`)
  console.log(`❌ Échouées: ${errorCount}`)
  console.log(`📦 Total: ${sampleProperties.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (successCount > 0) {
    console.log('🎉 Insertion terminée avec succès!')
    console.log('💡 Vous pouvez maintenant visualiser vos propriétés sur le frontend\n')
  } else {
    console.log('⚠️  Aucune propriété n\'a été insérée')
  }
}

// Exécuter le script
insertSampleProperties()
  .then(() => {
    console.log('✨ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })
