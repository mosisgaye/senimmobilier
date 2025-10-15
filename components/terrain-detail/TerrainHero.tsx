'use client'

import { Heart, Share2, MapPin, Square, BadgeCheck, Tag } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface TerrainHeroProps {
  terrain: {
    id: string
    title: string
    price_fcfa: number
    price_negotiable?: boolean
    area_sqm: number
    category: string
    legal_status: string
    city: string
    neighborhood?: string
    region?: string
    distance_ref?: string
    badges?: string[]
    verified?: boolean
    created_at: string
  }
}

export default function TerrainHero({ terrain }: TerrainHeroProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  // Formatage du prix
  const formatPrice = (price: number) => {
    const millions = price / 1000000
    if (millions >= 1) {
      return `${millions.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M FCFA`
    }
    return `${(price / 1000).toLocaleString('fr-FR')} K FCFA`
  }

  // Label statut légal
  const getLegalLabel = (status: string) => {
    const labels: Record<string, string> = {
      titre_foncier: 'Titre Foncier',
      bail: 'Bail',
      deliberation: 'Délibération',
      autre: 'Autre'
    }
    return labels[status] || status
  }

  // Label catégorie
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      urbain: '🏙️ Urbain',
      residentiel: '🏘️ Résidentiel',
      agricole: '🌾 Agricole',
      commercial: '🏢 Commercial',
      rural: '🌳 Rural'
    }
    return labels[category] || category
  }

  // Partager
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: terrain.title,
          text: `Découvrez ce terrain sur Fatimmo`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Partage annulé')
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier!')
    }
  }

  // Calculer ancienneté
  const getTimeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      {/* Actions rapides */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          {terrain.badges?.includes('verified') && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
              <BadgeCheck className="h-4 w-4" />
              Annonce vérifiée
            </span>
          )}
          {terrain.badges?.includes('new') && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              Nouveau
            </span>
          )}
          {terrain.badges?.includes('featured') && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              ⭐ Vedette
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Titre */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {terrain.title}
        </h1>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            {terrain.city}
            {terrain.neighborhood && `, ${terrain.neighborhood}`}
            {terrain.region && ` • ${terrain.region}`}
          </span>
          {terrain.distance_ref && (
            <span className="text-sm text-gray-500">• {terrain.distance_ref}</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Publié {getTimeAgo(terrain.created_at)}
        </p>
      </div>

      {/* Prix & Infos Clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Prix */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="col-span-2 md:col-span-1 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-4 text-center"
        >
          <div className="text-sm font-medium text-gray-900 mb-1">Prix</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(terrain.price_fcfa)}
          </div>
          {terrain.price_negotiable && (
            <div className="text-xs text-gray-700 mt-1">Négociable</div>
          )}
        </motion.div>

        {/* Surface */}
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <Square className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
          <div className="text-sm text-gray-600">Surface</div>
          <div className="text-xl font-bold text-gray-900">
            {terrain.area_sqm.toLocaleString('fr-FR')} m²
          </div>
        </div>

        {/* Catégorie */}
        <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
          <Tag className="h-5 w-5 text-purple-600 mx-auto mb-1" />
          <div className="text-sm text-gray-600">Type</div>
          <div className="text-sm font-bold text-gray-900">
            {getCategoryLabel(terrain.category)}
          </div>
        </div>

        {/* Statut Légal */}
        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
          <BadgeCheck className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <div className="text-sm text-gray-600">Statut</div>
          <div className="text-sm font-bold text-gray-900">
            {getLegalLabel(terrain.legal_status)}
          </div>
        </div>
      </div>

      {/* Prix au m² */}
      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-gray-600">Prix au m²</span>
        <span className="text-lg font-semibold text-gray-900">
          {((terrain.price_fcfa / terrain.area_sqm).toLocaleString('fr-FR', {
            maximumFractionDigits: 0
          }))} FCFA/m²
        </span>
      </div>
    </div>
  )
}
