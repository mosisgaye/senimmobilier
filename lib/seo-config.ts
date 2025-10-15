import { Metadata } from 'next'

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://senimmobilier.sn'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'SenImmobilier - Achat et Vente de Terrains au Sénégal',
    template: '%s | SenImmobilier',
  },
  description:
    'Plateforme leader pour l\'achat et la vente de terrains titrés au Sénégal. Trouvez votre terrain idéal à Dakar, Saly, Mbour, Thiès et partout au Sénégal. Terrains vérifiés avec titres fonciers.',
  keywords: [
    'terrain Sénégal',
    'vente terrain Dakar',
    'achat terrain Saly',
    'terrain titré Sénégal',
    'immobilier Sénégal',
    'terrain Mbour',
    'titre foncier',
    'terrain viabilisé',
    'investissement immobilier Sénégal',
    'terrain résidentiel',
    'terrain commercial',
    'parcelle terrain',
  ],
  authors: [{ name: 'SenImmobilier' }],
  creator: 'SenImmobilier',
  publisher: 'SenImmobilier',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: baseUrl,
    siteName: 'SenImmobilier',
    title: 'SenImmobilier - Achat et Vente de Terrains au Sénégal',
    description:
      'Plateforme leader pour l\'achat et la vente de terrains titrés au Sénégal. Trouvez votre terrain idéal à Dakar, Saly, Mbour et partout au Sénégal.',
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'SenImmobilier - Terrains au Sénégal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SenImmobilier - Achat et Vente de Terrains au Sénégal',
    description:
      'Plateforme leader pour l\'achat et la vente de terrains titrés au Sénégal.',
    images: [`${baseUrl}/images/og-image.jpg`],
    creator: '@senimmobilier',
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
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: '', // À ajouter lors de la vérification Google Search Console
    // yandex: '',
    // other: {},
  },
}

// Helper pour générer les métadonnées d'un terrain
export function generateTerrainMetadata(terrain: {
  title: string
  price_fcfa: number
  area_sqm: number
  city: string
  neighborhood?: string
  slug: string
  cover_image_url?: string
  excerpt?: string
}): Metadata {
  const url = `${baseUrl}/terrains/${terrain.slug}`
  const priceFormatted = new Intl.NumberFormat('fr-FR').format(terrain.price_fcfa)
  const title = `${terrain.title} - ${priceFormatted} FCFA`
  const description =
    terrain.excerpt ||
    `Terrain de ${terrain.area_sqm}m² à vendre à ${terrain.city}${
      terrain.neighborhood ? `, ${terrain.neighborhood}` : ''
    }. Prix: ${priceFormatted} FCFA. Consultez les détails et contactez le vendeur.`

  const image = terrain.cover_image_url || `${baseUrl}/images/og-image.jpg`

  return {
    title,
    description,
    keywords: [
      `terrain ${terrain.city}`,
      `vente terrain ${terrain.city}`,
      `terrain ${terrain.area_sqm}m²`,
      'terrain Sénégal',
      'immobilier Sénégal',
      terrain.neighborhood ? `terrain ${terrain.neighborhood}` : '',
    ].filter(Boolean),
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: terrain.title,
        },
      ],
      locale: 'fr_SN',
      siteName: 'SenImmobilier',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

// Helper pour générer les métadonnées de la page terrains avec filtres
export function generateTerrainsListMetadata(params: {
  city?: string
  category?: string
  count?: number
}): Metadata {
  const { city, category, count = 0 } = params

  let title = 'Terrains à Vendre au Sénégal'
  let description = `Découvrez ${count} terrains à vendre au Sénégal. Terrains titrés, viabilisés et vérifiés.`

  if (city) {
    title = `Terrains à Vendre à ${city} - ${count} annonces`
    description = `Trouvez votre terrain idéal à ${city}. ${count} terrains disponibles avec titres fonciers sécurisés.`
  }

  if (category) {
    const categoryLabels: Record<string, string> = {
      residentiel: 'Résidentiels',
      commercial: 'Commerciaux',
      agricole: 'Agricoles',
      urbain: 'Urbains',
    }
    const categoryLabel = categoryLabels[category] || category
    title = `Terrains ${categoryLabel} à Vendre au Sénégal`
    description = `Découvrez notre sélection de terrains ${categoryLabel.toLowerCase()} à vendre au Sénégal. ${count} annonces disponibles.`
  }

  if (city && category) {
    const categoryLabels: Record<string, string> = {
      residentiel: 'Résidentiels',
      commercial: 'Commerciaux',
      agricole: 'Agricoles',
      urbain: 'Urbains',
    }
    const categoryLabel = categoryLabels[category] || category
    title = `Terrains ${categoryLabel} à ${city} - ${count} annonces`
    description = `Terrains ${categoryLabel.toLowerCase()} à vendre à ${city}. ${count} offres avec titres fonciers sécurisés.`
  }

  const url = `${baseUrl}/terrains${city ? `?city=${city}` : ''}${category ? `${city ? '&' : '?'}category=${category}` : ''}`

  return {
    title,
    description,
    keywords: [
      city ? `terrain ${city}` : '',
      category ? `terrain ${category}` : '',
      'terrain Sénégal',
      'vente terrain',
      'titre foncier',
      'terrain viabilisé',
    ].filter(Boolean),
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [
        {
          url: `${baseUrl}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}
