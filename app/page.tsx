import { Metadata } from 'next'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import PropertyCard from '@/components/PropertyCard'
import Footer from '@/components/Footer'
import FeaturesSection from '@/components/home/FeaturesSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import CTASection from '@/components/home/CTASection'
import StatsSection from '@/components/home/StatsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd'
import { supabase } from '@/lib/supabase'

// Metadata for SEO
export const metadata: Metadata = {
  title: 'SenImmobilier - Terrains à Vendre au Sénégal | Plateforme Immobilière',
  description: 'Trouvez votre terrain idéal au Sénégal. Plus de 800 terrains titrés, viabilisés et vérifiés à Dakar, Mbour, Saly et partout au Sénégal. Transactions sécurisées avec agents certifiés.',
  keywords: [
    'terrain Sénégal',
    'terrain à vendre Dakar',
    'terrain titré Sénégal',
    'immobilier Sénégal',
    'terrain Mbour',
    'terrain Saly',
    'achat terrain Sénégal',
    'terrain viabilisé',
    'investissement immobilier Sénégal'
  ],
  openGraph: {
    title: 'SenImmobilier - Terrains à Vendre au Sénégal',
    description: 'La plateforme immobilière de référence au Sénégal. Plus de 800 terrains titrés et viabilisés.',
    url: 'https://senimmobilier.sn',
    siteName: 'SenImmobilier',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Terrains à vendre au Sénégal - SenImmobilier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SenImmobilier - Terrains à Vendre au Sénégal',
    description: 'La plateforme immobilière de référence au Sénégal. Plus de 800 terrains titrés et viabilisés.',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=630&fit=crop'],
  },
  alternates: {
    canonical: 'https://senimmobilier.sn',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Fetch featured properties server-side
async function getFeaturedProperties() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:sellers(name, phone_e164, verified, type, logo_url),
        media(url, type, is_cover, display_order)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  }
}

// Fetch stats server-side
async function getStats() {
  try {
    const [
      { count: totalListings },
      { count: totalSellers },
      { count: verifiedListings },
    ] = await Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('sellers').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'published').eq('verified', true),
    ])

    return {
      totalListings: totalListings || 0,
      totalSellers: totalSellers || 0,
      verifiedListings: verifiedListings || 0,
      satisfiedClients: 1200, // This would come from a reviews/clients table
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalListings: 800,
      totalSellers: 150,
      verifiedListings: 650,
      satisfiedClients: 1200,
    }
  }
}

export default async function Home() {
  // Fetch data server-side in parallel
  const [properties, stats] = await Promise.all([
    getFeaturedProperties(),
    getStats(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Schema.org JSON-LD */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <Header />
      <HeroSection />

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Featured Properties */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Propriétés en vedette
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection des meilleures propriétés disponibles actuellement
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune propriété disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {properties.length > 0 && (
            <div className="text-center mt-12">
              <a
                href="/terrains"
                className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-[0_5px_20px_rgba(16,185,129,0.3),0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4),0_0_15px_rgba(6,182,212,0.3)]"
              >
                Voir toutes les propriétés
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <CategoriesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features */}
      <FeaturesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Revalidation every 5 minutes
export const revalidate = 300
