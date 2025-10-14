import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TerrainsContent from '@/components/TerrainsContent'
import { supabase } from '@/lib/supabase'

// Fonction pour récupérer les terrains côté serveur
async function getTerrains(searchParams: any) {
  const {
    city,
    category,
    legal_status,
    min_price,
    max_price,
    min_area,
    max_area,
    features,
    verified,
    sort = 'newest',
    page = '1'
  } = searchParams

  const pageSize = 24
  const currentPage = parseInt(page)

  try {
    // Construction de la requête
    let query = supabase
      .from('listings')
      .select(`
        *,
        seller:sellers(type, name, verified, phone_e164),
        media(url, type, is_cover, display_order)
      `, { count: 'exact' })
      .eq('status', 'published')
      .eq('intent', 'sale')

    // Appliquer les filtres
    if (city) query = query.eq('city', city)
    if (category) query = query.eq('category', category)
    if (legal_status) query = query.eq('legal_status', legal_status)
    if (min_price) query = query.gte('price_fcfa', parseInt(min_price))
    if (max_price) query = query.lte('price_fcfa', parseInt(max_price))
    if (min_area) query = query.gte('area_sqm', parseInt(min_area))
    if (max_area) query = query.lte('area_sqm', parseInt(max_area))

    // Features filtering (JSONB)
    if (features) {
      const featureList = features.split(',').filter(Boolean)
      featureList.forEach((feature: string) => {
        const featureMapping: Record<string, string> = {
          'serviced': 'serviced',
          'bordered': 'bordered',
          'titre_foncier': 'title_deed_available'
        }
        const dbFeature = featureMapping[feature] || feature
        query = query.contains('features', { [dbFeature]: true })
      })
    }

    // Tri
    switch (sort) {
      case 'price_asc':
        query = query.order('price_fcfa', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price_fcfa', { ascending: false })
        break
      case 'area_asc':
        query = query.order('area_sqm', { ascending: true })
        break
      case 'area_desc':
        query = query.order('area_sqm', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Pagination
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      terrains: data || [],
      totalCount: count || 0,
      currentPage,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des terrains:', error)
    return {
      terrains: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0
    }
  }
}

// Fonction pour récupérer les facettes
async function getFacets() {
  try {
    // Compter par ville
    const { data: cityCounts } = await supabase
      .from('listings')
      .select('city')
      .eq('status', 'published')
      .eq('intent', 'sale')

    // Compter par catégorie
    const { data: categoryCounts } = await supabase
      .from('listings')
      .select('category')
      .eq('status', 'published')
      .eq('intent', 'sale')

    // Compter par statut légal
    const { data: legalCounts } = await supabase
      .from('listings')
      .select('legal_status')
      .eq('status', 'published')
      .eq('intent', 'sale')

    // Calculer les compteurs
    const countsByCity: Record<string, number> = {}
    cityCounts?.forEach(item => {
      countsByCity[item.city] = (countsByCity[item.city] || 0) + 1
    })

    const countsByCategory: Record<string, number> = {}
    categoryCounts?.forEach(item => {
      countsByCategory[item.category] = (countsByCategory[item.category] || 0) + 1
    })

    const countsByLegal: Record<string, number> = {}
    legalCounts?.forEach(item => {
      countsByLegal[item.legal_status] = (countsByLegal[item.legal_status] || 0) + 1
    })

    return {
      counts_by_city: countsByCity,
      counts_by_category: countsByCategory,
      counts_by_legal_status: countsByLegal
    }
  } catch (error) {
    console.error('Erreur facettes:', error)
    return {
      counts_by_city: {},
      counts_by_category: {},
      counts_by_legal_status: {}
    }
  }
}

// Page principale (Server Component)
export default async function TerrainsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams (Next.js 15)
  const params = await searchParams

  // Récupération des données côté serveur
  const [terrainsData, facetsData] = await Promise.all([
    getTerrains(params),
    getFacets()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terrains à Vendre au Sénégal
          </h1>
          <p className="text-xl text-white/90 mb-6">
            {terrainsData.totalCount} terrains disponibles • Trouvez votre parcelle idéale
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-4 py-2 bg-white/20 rounded-full">
              🏆 Terrains vérifiés
            </span>
            <span className="px-4 py-2 bg-white/20 rounded-full">
              📜 Titres fonciers disponibles
            </span>
            <span className="px-4 py-2 bg-white/20 rounded-full">
              💰 Paiement échelonné possible
            </span>
          </div>
        </div>
      </section>

      {/* Content avec interactions client */}
      <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
        <TerrainsContent
          initialTerrains={terrainsData.terrains}
          initialTotalCount={terrainsData.totalCount}
          initialFacets={facetsData}
          initialPage={terrainsData.currentPage}
          totalPages={terrainsData.totalPages}
          searchParams={params}
        />
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Metadata pour le SEO
export const metadata = {
  title: 'Terrains à Vendre au Sénégal | Fatimmo',
  description: 'Découvrez notre sélection de terrains à vendre au Sénégal. Terrains titrés, viabilisés et vérifiés à Dakar, Saly, Mbour et dans tout le Sénégal.',
  keywords: ['terrain', 'vente', 'Sénégal', 'Dakar', 'immobilier', 'titre foncier']
}
