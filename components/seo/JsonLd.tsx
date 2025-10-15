import { baseUrl } from '@/lib/seo-config'

interface RealEstateListingProps {
  terrain: {
    id: string
    slug: string
    title: string
    description?: string
    price_fcfa: number
    area_sqm: number
    city: string
    neighborhood?: string
    lat?: number
    lng?: number
    legal_status: string
    category: string
    cover_image_url?: string
    created_at: string
    updated_at?: string
    seller?: {
      name: string
      type: 'agency' | 'owner'
      verified?: boolean
      phone_e164?: string
    }
  }
}

export function RealEstateListingJsonLd({ terrain }: RealEstateListingProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${baseUrl}/terrains/${terrain.slug}`,
    name: terrain.title,
    description: terrain.description || `Terrain de ${terrain.area_sqm}m² à vendre à ${terrain.city}`,
    url: `${baseUrl}/terrains/${terrain.slug}`,
    image: terrain.cover_image_url || `${baseUrl}/images/og-image.jpg`,
    datePosted: terrain.created_at,
    dateModified: terrain.updated_at || terrain.created_at,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: terrain.price_fcfa,
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 jours
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: terrain.city,
      addressRegion: terrain.neighborhood,
      addressCountry: 'SN',
    },
    ...(terrain.lat &&
      terrain.lng && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: terrain.lat,
          longitude: terrain.lng,
        },
      }),
    floorSize: {
      '@type': 'QuantitativeValue',
      value: terrain.area_sqm,
      unitCode: 'MTK', // Mètre carré
    },
    category: terrain.category,
    ...(terrain.seller && {
      seller: {
        '@type': terrain.seller.type === 'agency' ? 'RealEstateAgent' : 'Person',
        name: terrain.seller.name,
        ...(terrain.seller.phone_e164 && {
          telephone: terrain.seller.phone_e164,
        }),
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${baseUrl}/#organization`,
    name: 'SenImmobilier',
    url: baseUrl,
    logo: `${baseUrl}/images/senimmobilier.svg`,
    description:
      'Plateforme leader pour l\'achat et la vente de terrains titrés au Sénégal. Terrains vérifiés avec titres fonciers.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dakar',
      addressCountry: 'SN',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Dakar',
      },
      {
        '@type': 'City',
        name: 'Saly',
      },
      {
        '@type': 'City',
        name: 'Mbour',
      },
      {
        '@type': 'City',
        name: 'Thiès',
      },
    ],
    sameAs: [
      // À ajouter vos réseaux sociaux
      // 'https://www.facebook.com/senimmobilier',
      // 'https://www.instagram.com/senimmobilier',
      // 'https://twitter.com/senimmobilier',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; url: string }> }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'SenImmobilier',
    description: 'Plateforme immobilière pour l\'achat et la vente de terrains au Sénégal',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/terrains?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
