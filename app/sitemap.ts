import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://senimmobilier.sn'

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/terrains`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/partenaires`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Récupérer tous les terrains publiés
  try {
    const { data: terrains } = await supabase
      .from('listings')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .eq('intent', 'sale')
      .order('created_at', { ascending: false })

    const terrainPages: MetadataRoute.Sitemap = (terrains || []).map((terrain) => ({
      url: `${baseUrl}/terrains/${terrain.slug}`,
      lastModified: new Date(terrain.updated_at || terrain.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Récupérer les villes uniques pour les pages de filtrage
    const { data: cities } = await supabase
      .from('listings')
      .select('city')
      .eq('status', 'published')
      .eq('intent', 'sale')

    const uniqueCities = [...new Set((cities || []).map(c => c.city))]

    const cityPages: MetadataRoute.Sitemap = uniqueCities.map((city) => ({
      url: `${baseUrl}/terrains?city=${encodeURIComponent(city)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...terrainPages, ...cityPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // En cas d'erreur, retourner au moins les pages statiques
    return staticPages
  }
}
