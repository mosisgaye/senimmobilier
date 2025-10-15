import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TerrainGallery from '@/components/terrain-detail/TerrainGallery'
import TerrainHero from '@/components/terrain-detail/TerrainHero'
import TerrainFeatures from '@/components/terrain-detail/TerrainFeatures'
import TerrainDescription from '@/components/terrain-detail/TerrainDescription'
import DocumentsPanel from '@/components/terrain-detail/DocumentsPanel'
import FeaturesSidebar from '@/components/terrain-detail/FeaturesSidebar'
import { RealEstateListingJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { generateTerrainMetadata, baseUrl } from '@/lib/seo-config'
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
      {/* SEO JSON-LD Schema.org */}
      <RealEstateListingJsonLd terrain={terrain} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', url: baseUrl },
          { name: 'Terrains', url: `${baseUrl}/terrains` },
          { name: terrain.city, url: `${baseUrl}/terrains?city=${terrain.city}` },
          { name: terrain.title, url: `${baseUrl}/terrains/${terrain.slug}` },
        ]}
      />

      <Header />

      {/* Galerie avec visite guidée */}
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

            {/* Documents Légaux */}
            {terrain.documents && terrain.documents.length > 0 && (
              <DocumentsPanel documents={terrain.documents} verified={terrain.verified} />
            )}

          </div>

          {/* Sidebar Caractéristiques & Atouts (1/3) - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FeaturesSidebar terrain={terrain} />
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Génération des métadonnées SEO optimisées
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const terrain = await getTerrain(slug)

  if (!terrain) {
    return {
      title: 'Terrain non trouvé | SenImmobilier',
      description: 'Ce terrain n\'est plus disponible ou n\'existe pas.',
    }
  }

  return generateTerrainMetadata(terrain)
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
