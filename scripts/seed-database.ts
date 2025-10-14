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

// Données d'exemple pour les vendeurs
const sampleSellers = [
  {
    type: 'agency',
    name: 'Fatimmo Immobilier',
    phone_e164: '+221776543210',
    email: 'contact@fatimmo.sn',
    verified: true,
    rating: 4.8,
    review_count: 45,
    bio: 'Agence immobilière leader au Sénégal, spécialisée dans la vente de terrains titrés.',
    website: 'https://fatimmo.sn',
    whatsapp_number: '+221776543210'
  },
  {
    type: 'owner',
    name: 'Mamadou Diop',
    phone_e164: '+221775678901',
    email: 'mamadou.diop@email.com',
    verified: true,
    rating: 4.5,
    review_count: 12,
    bio: 'Propriétaire de plusieurs terrains à Dakar et Thiès.',
    whatsapp_number: '+221775678901'
  },
  {
    type: 'agency',
    name: 'Sénégal Immobilier Pro',
    phone_e164: '+221774561230',
    email: 'contact@senegalimmopro.com',
    verified: true,
    rating: 4.6,
    review_count: 28,
    bio: 'Experts en immobilier côtier et touristique.',
    website: 'https://senegalimmopro.com',
    whatsapp_number: '+221774561230'
  }
]

// Données d'exemple pour les annonces (listings)
const getSampleListings = (sellerIds: string[]) => [
  {
    seller_id: sellerIds[0],
    title: 'Terrain Titré 500m² Almadies Vue Mer',
    description: `Magnifique terrain titré de 500m² situé dans le quartier prestigieux des Almadies à Dakar.

🌊 Situation exceptionnelle avec vue sur l'océan Atlantique
📜 Titre foncier en règle - Propriété sécurisée
🏗️ Zone résidentielle de standing
💡 Viabilisé : Eau, électricité, assainissement
🛣️ Accès goudronné, sécurité 24h/24

Idéal pour construction de villa moderne de luxe. Quartier calme et verdoyant, proche de toutes commodités.

📍 Proximité:
- Plage des Almadies: 500m
- Écoles internationales: 2km
- Centres commerciaux: 1.5km
- Hôpitaux: 3km
- Aéroport AIBD: 45km`,
    intent: 'sale',
    category: 'residentiel',
    price_fcfa: 75000000,
    area_sqm: 500,
    legal_status: 'titre_foncier',
    city: 'Dakar',
    region: 'Dakar',
    neighborhood: 'Almadies',
    lat: 14.7392,
    lng: -17.5022,
    show_exact_location: true,
    features: {
      bordered: true,
      serviced: true,
      soil_type: 'sablonneux',
      zoning: 'residential',
      slope: 'flat',
      title_deed_available: true
    },
    proximity: {
      beach: '500m',
      school: '2km',
      hospital: '3km',
      market: '1.5km'
    },
    badges: ['Titre Foncier', 'Viabilisé', 'Vue Mer', 'Sécurisé'],
    cover_image_url: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    seller_id: sellerIds[1],
    title: 'Terrain 300m² Mbour Proche Mer',
    description: `Terrain viabilisé à Mbour, à proximité immédiate de la plage. Parfait pour investissement locatif ou résidence secondaire.

🏖️ À 200m de la plage
💡 Électricité et eau disponibles
📜 Bail de 99 ans (en cours de titre)
🌳 Environnement calme et verdoyant

Zone touristique en développement, excellent potentiel d'investissement. Idéal pour construction de maison d'hôtes ou villa de location saisonnière.`,
    intent: 'sale',
    category: 'residentiel',
    price_fcfa: 18000000,
    price_negotiable: true,
    area_sqm: 300,
    legal_status: 'bail',
    city: 'Mbour',
    region: 'Thiès',
    neighborhood: 'Mbour Centre',
    lat: 14.4196,
    lng: -16.9605,
    show_exact_location: false,
    features: {
      bordered: true,
      serviced: true,
      soil_type: 'sablonneux',
      slope: 'flat'
    },
    proximity: {
      beach: '200m',
      restaurant: '300m',
      market: '1km'
    },
    badges: ['Viabilisé', 'Proche Mer', 'Négociable'],
    cover_image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    seller_id: sellerIds[2],
    title: 'Grand Terrain 1000m² Saly Zone Touristique',
    description: `Vaste terrain de 1000m² dans la prestigieuse zone touristique de Saly Portudal. Emplacement exceptionnel pour projet hôtelier ou résidence de luxe.

⭐ Zone touristique classée
📜 Titre foncier
🏖️ À 800m de la plage
🏌️ Proche du golf de Saly
🏪 Toutes commodités à proximité

Situé dans un environnement calme avec accès facile aux plages et infrastructures touristiques. Idéal pour investisseurs ou projet d'hôtel boutique.`,
    intent: 'sale',
    category: 'commercial',
    price_fcfa: 50000000,
    area_sqm: 1000,
    legal_status: 'titre_foncier',
    city: 'Saly',
    region: 'Thiès',
    neighborhood: 'Saly Portudal',
    lat: 14.4520,
    lng: -17.0324,
    show_exact_location: true,
    features: {
      bordered: true,
      serviced: true,
      soil_type: 'sablonneux',
      zoning: 'commercial',
      slope: 'flat',
      title_deed_available: true
    },
    proximity: {
      beach: '800m',
      golf: '1.5km',
      hotel: '500m',
      restaurant: '400m'
    },
    badges: ['Titre Foncier', 'Zone Touristique', 'Commercial', 'Viabilisé'],
    cover_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    seller_id: sellerIds[0],
    title: 'Terrain Résidentiel 200m² Pikine',
    description: `Terrain borné dans un quartier résidentiel en plein développement à Pikine. Excellent rapport qualité-prix pour première acquisition.

💰 Prix accessible
📍 Bien situé, accès facile
🏘️ Quartier résidentiel dynamique
🚌 Transport en commun à proximité

Quartier en développement avec toutes commodités : écoles, marchés, mosquées. Idéal pour construction de première maison.`,
    intent: 'sale',
    category: 'urbain',
    price_fcfa: 8000000,
    price_negotiable: true,
    area_sqm: 200,
    legal_status: 'deliberation',
    city: 'Pikine',
    region: 'Dakar',
    neighborhood: 'Pikine Guédiawaye',
    lat: 14.7547,
    lng: -17.3986,
    show_exact_location: false,
    features: {
      bordered: true,
      serviced: false,
      soil_type: 'argileux',
      slope: 'flat'
    },
    proximity: {
      school: '500m',
      market: '800m',
      mosque: '300m'
    },
    badges: ['Prix Accessible', 'Négociable', 'Borné'],
    cover_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    seller_id: sellerIds[1],
    title: 'Terrain Agricole 2 Hectares Thiès',
    description: `Grande parcelle agricole de 2 hectares (20,000m²) située à Thiès. Sol fertile, parfait pour exploitation maraîchère ou agricole.

🌾 Sol riche et fertile
💧 Accès à l'eau (forage possible)
🚜 Terrain plat, facile à cultiver
🛣️ Accès par route goudronnée
📜 Titre foncier

Idéal pour investissement agricole rentable. Possibilité de raccordement électrique. Zone agricole productive avec rendements élevés.`,
    intent: 'sale',
    category: 'agricole',
    price_fcfa: 35000000,
    area_sqm: 20000,
    legal_status: 'titre_foncier',
    city: 'Thiès',
    region: 'Thiès',
    lat: 14.7889,
    lng: -16.9324,
    show_exact_location: true,
    features: {
      bordered: true,
      serviced: false,
      soil_type: 'argileux_fertile',
      zoning: 'agricultural',
      slope: 'flat',
      title_deed_available: true,
      water_access: true
    },
    proximity: {
      village: '2km',
      road: 'Bordure route goudronnée'
    },
    badges: ['Titre Foncier', 'Agricole', 'Grande Surface', 'Sol Fertile'],
    cover_image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    seller_id: sellerIds[2],
    title: 'Terrain de Luxe 800m² Ngor Vue Panoramique',
    description: `Terrain d'exception de 800m² dans le quartier ultra-prisé de Ngor. Vue panoramique spectaculaire sur l'océan et l'île de Ngor.

🌊 Vue panoramique exceptionnelle
📜 Titre foncier sécurisé
🏘️ Zone résidentielle haut standing
💎 Emplacement unique et rare
🔒 Sécurité maximale 24h/24

Quartier exclusif avec toutes commodités de luxe à proximité. Idéal pour villa d'architecte ou résidence de prestige. Accès direct aux plus belles plages de Dakar.`,
    intent: 'sale',
    category: 'residentiel',
    price_fcfa: 120000000,
    area_sqm: 800,
    legal_status: 'titre_foncier',
    city: 'Dakar',
    region: 'Dakar',
    neighborhood: 'Ngor',
    lat: 14.7503,
    lng: -17.5153,
    show_exact_location: true,
    features: {
      bordered: true,
      serviced: true,
      soil_type: 'rocheux',
      zoning: 'residential_luxury',
      slope: 'moderate',
      title_deed_available: true,
      ocean_view: true
    },
    proximity: {
      beach: '300m',
      restaurant: '500m',
      hotel_5_stars: '1km'
    },
    badges: ['Luxe', 'Titre Foncier', 'Vue Mer', 'Ngor', 'Exclusif'],
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    seller_id: sellerIds[0],
    title: 'Terrain 350m² Toubab Dialaw Village Artistique',
    description: `Charmant terrain de 350m² dans le village artistique de Toubab Dialaw, à 45km de Dakar.

🎨 Village artistique authentique
🌴 Ambiance nature et calme
🏖️ Proche de la plage
🌅 Cadre paradisiaque

Parfait pour résidence nature, projet éco-touristique ou maison d'artiste. Communauté accueillante, authenticité préservée.`,
    intent: 'sale',
    category: 'rural',
    price_fcfa: 12000000,
    price_negotiable: true,
    area_sqm: 350,
    legal_status: 'deliberation',
    city: 'Toubab Dialaw',
    region: 'Thiès',
    neighborhood: 'Toubab Dialaw',
    lat: 14.5833,
    lng: -17.0833,
    show_exact_location: false,
    features: {
      bordered: true,
      serviced: false,
      soil_type: 'sablonneux',
      slope: 'flat'
    },
    proximity: {
      beach: '800m',
      village: 'Centre village'
    },
    badges: ['Nature', 'Artistique', 'Calme', 'Négociable'],
    cover_image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  },
  {
    seller_id: sellerIds[1],
    title: 'Terrain Commercial 400m² Rufisque Centre',
    description: `Emplacement commercial stratégique de 400m² au cœur de Rufisque. Forte visibilité et passage important.

🏪 Axe commercial principal
👁️ Très forte visibilité
🚌 Arrêt transport devant
📜 Titre foncier en cours

Idéal pour boutique, restaurant, bureau ou commerce. Zone commerciale dynamique en pleine expansion. Excellent potentiel de rentabilité.`,
    intent: 'sale',
    category: 'commercial',
    price_fcfa: 22000000,
    area_sqm: 400,
    legal_status: 'bail',
    city: 'Rufisque',
    region: 'Dakar',
    neighborhood: 'Rufisque Centre',
    lat: 14.7167,
    lng: -17.2667,
    show_exact_location: true,
    features: {
      bordered: true,
      serviced: true,
      soil_type: 'sablonneux',
      zoning: 'commercial',
      slope: 'flat',
      high_visibility: true
    },
    proximity: {
      bank: '200m',
      market: '500m',
      station: '300m'
    },
    badges: ['Commercial', 'Centre Ville', 'Viabilisé', 'Visibilité'],
    cover_image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
    status: 'published',
    published_at: new Date().toISOString()
  }
]

// Médias pour chaque annonce
const getSampleMedia = (listingIds: string[]) => {
  const mediaList = []

  listingIds.forEach((listingId, index) => {
    // Images de base (3-5 par annonce)
    const imageUrls = [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop'
    ]

    // 3-4 images par annonce
    const numImages = 3 + (index % 2)
    for (let i = 0; i < numImages; i++) {
      mediaList.push({
        listing_id: listingId,
        url: imageUrls[i % imageUrls.length],
        type: 'image',
        is_cover: i === 0, // La première image est la couverture
        title: `Photo ${i + 1}`,
        display_order: i,
        width: 1200,
        height: 800
      })
    }
  })

  return mediaList
}

async function seedDatabase() {
  console.log('🚀 Début du peuplement de la base de données...\n')

  try {
    // 1. Insérer les vendeurs
    console.log('👥 [1/3] Insertion des vendeurs...')
    const { data: sellers, error: sellersError } = await supabase
      .from('sellers')
      .insert(sampleSellers)
      .select()

    if (sellersError) {
      console.error('❌ Erreur lors de l\'insertion des vendeurs:', sellersError.message)
      process.exit(1)
    }

    console.log(`✅ ${sellers.length} vendeurs insérés\n`)

    // 2. Insérer les annonces
    console.log('🏠 [2/3] Insertion des annonces...')
    const sellerIds = sellers.map(s => s.id)
    const listings = getSampleListings(sellerIds)

    const { data: insertedListings, error: listingsError } = await supabase
      .from('listings')
      .insert(listings)
      .select()

    if (listingsError) {
      console.error('❌ Erreur lors de l\'insertion des annonces:', listingsError.message)
      process.exit(1)
    }

    console.log(`✅ ${insertedListings.length} annonces insérées\n`)

    // 3. Insérer les médias
    console.log('📸 [3/3] Insertion des médias...')
    const listingIds = insertedListings.map(l => l.id)
    const media = getSampleMedia(listingIds)

    const { data: insertedMedia, error: mediaError } = await supabase
      .from('media')
      .insert(media)
      .select()

    if (mediaError) {
      console.error('❌ Erreur lors de l\'insertion des médias:', mediaError.message)
      process.exit(1)
    }

    console.log(`✅ ${insertedMedia.length} médias insérés\n`)

    // Résumé
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RÉSUMÉ')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`👥 Vendeurs: ${sellers.length}`)
    console.log(`🏠 Annonces: ${insertedListings.length}`)
    console.log(`📸 Médias: ${insertedMedia.length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('🎉 Base de données peuplée avec succès!')
    console.log('💡 Vous pouvez maintenant:')
    console.log('   - Démarrer votre application: npm run dev')
    console.log('   - Voir les données dans Supabase Dashboard')
    console.log('   - Tester les API routes\n')

  } catch (error: any) {
    console.error('💥 Erreur fatale:', error.message)
    process.exit(1)
  }
}

// Exécuter le script
seedDatabase()
  .then(() => {
    console.log('✨ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erreur:', error)
    process.exit(1)
  })
