# 💻 Exemples de Code - Fatimmo

## 🎨 Exemples Ready-to-Use pour le Frontend

---

## 1️⃣ Récupérer et Afficher les Annonces

### app/page.tsx (Version Complète)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MapPin, Ruler, BadgeCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface Listing {
  id: string
  slug: string
  title: string
  city: string
  neighborhood?: string
  price_fcfa: number
  area_sqm: number
  badges: string[]
  cover_image_url?: string
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(8)

      if (!error && data) {
        setListings(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Terrains Disponibles</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Image */}
              <div className="relative h-64">
                <img
                  src={listing.cover_image_url || 'https://via.placeholder.com/400x300'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.badges?.[0] && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {listing.badges[0]}
                  </span>
                )}
              </div>

              {/* Contenu */}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {listing.title}
                </h3>

                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{listing.city}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                  <Ruler className="h-4 w-4 mr-1" />
                  <span className="text-sm">{listing.area_sqm} m²</span>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(listing.price_fcfa)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 2️⃣ Composant ListingCard Réutilisable

### components/ListingCard.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { MapPin, Ruler, BadgeCheck, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface ListingCardProps {
  listing: {
    id: string
    slug: string
    title: string
    description?: string
    price_fcfa: number
    area_sqm: number
    city: string
    neighborhood?: string
    badges?: string[]
    cover_image_url?: string
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const formatPrice = (price: number) => {
    const millions = price / 1000000
    if (millions >= 1) {
      return `${millions.toFixed(0)}M FCFA`
    }
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
    >
      {/* Image */}
      <Link href={`/listings/${listing.slug}`}>
        <div className="relative h-64 overflow-hidden cursor-pointer">
          <img
            src={listing.cover_image_url || 'https://via.placeholder.com/400x300'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Badges */}
          {listing.badges && listing.badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {listing.badges.slice(0, 2).map((badge, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Bouton Favori */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-5">
        <Link href={`/listings/${listing.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
            {listing.title}
          </h3>
        </Link>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {listing.city}
              {listing.neighborhood && `, ${listing.neighborhood}`}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Ruler className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {listing.area_sqm.toLocaleString('fr-FR')} m²
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500 mb-1">Prix</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(listing.price_fcfa)}
            </p>
          </div>

          <Link href={`/listings/${listing.slug}`}>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Voir
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
```

---

## 3️⃣ Filtres de Recherche

### components/ListingFilters.tsx

```typescript
'use client'

import { useState } from 'react'

interface FilterProps {
  onFilterChange: (filters: any) => void
}

export default function ListingFilters({ onFilterChange }: FilterProps) {
  const [city, setCity] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [category, setCategory] = useState('')

  const cities = ['Dakar', 'Thiès', 'Mbour', 'Saly', 'Pikine', 'Rufisque', 'Toubab Dialaw']
  const categories = ['residentiel', 'commercial', 'agricole', 'urbain', 'rural']

  const handleSearch = () => {
    onFilterChange({
      city: city || undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      category: category || undefined
    })
  }

  const handleReset = () => {
    setCity('')
    setMinPrice('')
    setMaxPrice('')
    setCategory('')
    onFilterChange({})
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6">Rechercher un terrain</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ville
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les villes</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Prix Min */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix Min (FCFA)
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Ex: 5000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Prix Max */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix Max (FCFA)
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Ex: 50000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSearch}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Rechercher
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}
```

---

## 4️⃣ Page Complète avec Filtres

### app/listings/page.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ListingCard from '@/components/ListingCard'
import ListingFilters from '@/components/ListingFilters'

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')

      // Appliquer les filtres
      if (filters.city) query = query.eq('city', filters.city)
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.minPrice) query = query.gte('price_fcfa', filters.minPrice)
      if (filters.maxPrice) query = query.lte('price_fcfa', filters.maxPrice)

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (!error && data) {
        setListings(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">
          Tous les Terrains ({listings.length})
        </h1>

        <ListingFilters onFilterChange={setFilters} />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucune annonce trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 5️⃣ Requêtes Supabase Utiles

```typescript
// Récupérer avec vendeur et médias
const { data } = await supabase
  .from('listings')
  .select(`
    *,
    seller:sellers(*),
    media(*)
  `)
  .eq('status', 'published')

// Recherche par texte
const { data } = await supabase
  .from('listings')
  .select('*')
  .textSearch('title', 'terrain dakar')

// Filtrer par zone géographique (rayon)
const { data } = await supabase
  .rpc('listings_near_point', {
    lat: 14.7392,
    lng: -17.5022,
    radius_km: 10
  })

// Top des annonces les plus vues
const { data } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'published')
  .order('view_count', { ascending: false })
  .limit(10)

// Annonces récentes
const { data } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'published')
  .gte('published_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
  .order('published_at', { ascending: false })
```

---

## 🎯 Tester Rapidement

Copiez-collez ce code minimal dans `app/test-listings/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [listings, setListings] = useState([])

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'published')
      .then(({ data }) => data && setListings(data))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Test - {listings.length} Annonces
      </h1>
      <div className="space-y-4">
        {listings.map((l: any) => (
          <div key={l.id} className="p-4 bg-white rounded shadow">
            <h2 className="font-bold">{l.title}</h2>
            <p className="text-gray-600">{l.city} - {l.price_fcfa.toLocaleString()} FCFA</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Puis visitez: `http://localhost:3000/test-listings`

---

**Tous ces exemples sont prêts à l'emploi avec vos données !** 🚀
