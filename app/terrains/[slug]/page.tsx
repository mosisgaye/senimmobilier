import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TerrainGallery from '@/components/terrain-detail/TerrainGallery'
import TerrainHero from '@/components/terrain-detail/TerrainHero'
import TerrainFeatures from '@/components/terrain-detail/TerrainFeatures'
import TerrainDescription from '@/components/terrain-detail/TerrainDescription'
import TerrainMapDetail from '@/components/terrain-detail/TerrainMapDetail'
import DocumentsPanel from '@/components/terrain-detail/DocumentsPanel'
import ContactSidebar from '@/components/terrain-detail/ContactSidebar'
import SellerCard from '@/components/terrain-detail/SellerCard'
import SimilarTerrains from '@/components/terrain-detail/SimilarTerrains'
import { supabase } from '@/lib/supabase'

// Fonction pour récupérer le terrain par slug
async function getTerrain(slug: string) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:sellers(
          id,
          type,
          name,
          verified,
          phone_e164,
          whatsapp_number,
          email,
          logo_url
        ),
        media(
          id,
          url,
          type,
          is_cover,
          display_order,
          title
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur récupération terrain:', error)
    return null
  }
}

// Fonction pour récupérer les terrains similaires
async function getSimilarTerrains(currentTerrain: any) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:sellers(type, name, verified),
        media(url, type, is_cover)
      `)
      .eq('status', 'published')
      .eq('intent', currentTerrain.intent)
      .eq('city', currentTerrain.city)
      .neq('id', currentTerrain.id)
      .limit(6)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erreur terrains similaires:', error)
    return []
  }
}

// Page principale (Server Component)
export default async function TerrainDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const terrain = await getTerrain(slug)

  // 404 si terrain non trouvé
  if (!terrain) {
    notFound()
  }

  // Récupérer terrains similaires
  const similarTerrains = await getSimilarTerrains(terrain)

  // Organiser les médias
  const coverImage = terrain.cover_image_url ||
    terrain.media?.find((m: any) => m.is_cover)?.url ||
    terrain.media?.[0]?.url ||
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop'

  const allMedia = terrain.media?.sort((a: any, b: any) =>
    (a.display_order || 999) - (b.display_order || 999)
  ) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero avec galerie */}
      <div className="mt-16">
        <TerrainGallery media={allMedia} coverImage={coverImage} title={terrain.title} />
      </div>

      {/* Conteneur principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonne principale (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero Info */}
            <TerrainHero terrain={terrain} />

            {/* Description */}
            <TerrainDescription
              description={terrain.description}
              descriptionHtml={terrain.description_html}
              excerpt={terrain.excerpt}
            />

            {/* Caractéristiques */}
            <TerrainFeatures
              features={terrain.features}
              proximity={terrain.proximity}
              category={terrain.category}
              legalStatus={terrain.legal_status}
              areaSqm={terrain.area_sqm}
            />

            {/* Carte Interactive + Street View + Distances */}
            <TerrainMapDetail
              lat={terrain.lat}
              lng={terrain.lng}
              geoPolygon={terrain.geom}
              city={terrain.city}
              neighborhood={terrain.neighborhood}
              address={terrain.address}
            />

            {/* Documents Légaux */}
            {terrain.documents && terrain.documents.length > 0 && (
              <DocumentsPanel documents={terrain.documents} verified={terrain.verified} />
            )}

            {/* Informations Vendeur */}
            <SellerCard seller={terrain.seller} />

          </div>

          {/* Sidebar Contact (1/3) - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ContactSidebar
                terrain={terrain}
                seller={terrain.seller}
              />
            </div>
          </div>

        </div>

        {/* Terrains similaires */}
        {similarTerrains.length > 0 && (
          <div className="mt-16">
            <SimilarTerrains terrains={similarTerrains} currentCity={terrain.city} />
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Génération des métadonnées SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const terrain = await getTerrain(slug)

  if (!terrain) {
    return {
      title: 'Terrain non trouvé | Fatimmo',
    }
  }

  const price = new Intl.NumberFormat('fr-FR').format(terrain.price_fcfa)
  const coverImage = terrain.cover_image_url ||
    terrain.media?.find((m: any) => m.is_cover)?.url

  return {
    title: `${terrain.title} | Fatimmo`,
    description: terrain.excerpt || `${terrain.title} - ${price} FCFA - ${terrain.area_sqm}m² à ${terrain.city}. ${terrain.legal_status === 'titre_foncier' ? 'Titre foncier disponible.' : ''}`,
    keywords: [
      'terrain',
      terrain.city,
      terrain.category,
      terrain.legal_status,
      'sénégal',
      'immobilier',
      terrain.intent === 'sale' ? 'vente' : 'location'
    ],
    openGraph: {
      title: terrain.title,
      description: terrain.excerpt,
      images: coverImage ? [coverImage] : [],
      type: 'website',
      siteName: 'Fatimmo',
    },
    twitter: {
      card: 'summary_large_image',
      title: terrain.title,
      description: terrain.excerpt,
      images: coverImage ? [coverImage] : [],
    },
  }
}

// Génération statique des routes (ISR - Incremental Static Regeneration)
export async function generateStaticParams() {
  const { data: terrains } = await supabase
    .from('listings')
    .select('slug')
    .eq('status', 'published')
    .limit(50) // Limiter pour le build initial

  return terrains?.map((terrain) => ({
    slug: terrain.slug,
  })) || []
}

// Revalidation toutes les 5 minutes
export const revalidate = 300
