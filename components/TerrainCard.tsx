'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Heart,
  MapPin,
  Square,
  Phone,
  Mail,
  BadgeCheck,
  Zap,
  Droplet,
  Navigation,
  Waves,
  Compass,
  Grid3x3,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useComparison } from '@/lib/ComparisonContext'

interface TerrainCardProps {
  terrain: {
    id: string
    slug: string
    title: string
    price_fcfa: number
    area_sqm: number
    legal_status: string
    city: string
    region?: string
    neighborhood?: string
    distance_ref?: string
    lat?: number
    lng?: number
    cover_image_url?: string
    badges?: string[]
    features?: {
      bordered?: boolean           // Terrain borné
      serviced?: boolean          // Viabilisé (eau + électricité)
      title_deed_available?: boolean
      soil_type?: string          // Type de sol
      zoning?: string            // Zone (residential, commercial, etc.)
      slope?: string             // Pente (flat, gentle, moderate)
    }
    proximity?: Record<string, string> // ex: {"beach": "500m", "school": "2km"}
    seller?: {
      type: 'agency' | 'owner'
      name: string
      verified: boolean
      phone_e164?: string
    }
    media?: Array<{ url: string; is_cover: boolean }>
    excerpt?: string
    created_at: string
  }
}

export default function TerrainCard({ terrain }: TerrainCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { isSelected, addTerrain, removeTerrain, canAddMore } = useComparison()

  // Formatage du prix
  const formatPrice = (price: number) => {
    const millions = price / 1000000
    if (millions >= 1) {
      return `${millions.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}M FCFA`
    }
    return `${(price / 1000).toLocaleString('fr-FR')}K FCFA`
  }

  // Formatage de la surface
  const formatArea = (area: number) => {
    return `${area.toLocaleString('fr-FR')} m²`
  }

  // Label du statut légal
  const getLegalLabel = (status: string) => {
    const labels: Record<string, string> = {
      titre_foncier: 'Titre Foncier',
      bail: 'Bail',
      deliberation: 'Délibération',
      autre: 'Autre'
    }
    return labels[status] || status
  }

  // Icônes des features (max 3) - BASÉ SUR LA DB RÉELLE
  const getFeatureIcons = () => {
    const icons = []
    const features = terrain.features || {}
    const proximity = terrain.proximity || {}

    // Viabilisé = Eau + Électricité
    if (features.serviced) {
      icons.push({ icon: Zap, label: 'Viabilisé', color: 'text-yellow-500' })
    }

    // Borné
    if (features.bordered) {
      icons.push({ icon: Compass, label: 'Borné', color: 'text-green-600' })
    }

    // Titre foncier disponible
    if (features.title_deed_available) {
      icons.push({ icon: BadgeCheck, label: 'TF Dispo', color: 'text-emerald-600' })
    }

    // Proche de la mer (depuis proximity)
    if (proximity.beach || proximity.sea) {
      icons.push({ icon: Waves, label: 'Mer', color: 'text-cyan-500' })
    }

    // Accès route (si slope = flat, bon accès)
    if (features.slope === 'flat') {
      icons.push({ icon: Navigation, label: 'Accès Facile', color: 'text-gray-600' })
    }

    return icons.slice(0, 3)
  }

  // Lien WhatsApp
  const getWhatsAppLink = () => {
    if (!terrain.seller?.phone_e164) return null

    const message = encodeURIComponent(
      `Bonjour, je viens de voir votre annonce Fatimmo :\n- ${terrain.title} (${terrain.id})\n- https://fatimmo.sn/terrains/${terrain.slug}\nMerci !`
    )
    return `https://wa.me/${terrain.seller.phone_e164.replace('+', '')}?text=${message}`
  }

  // Image de couverture
  const coverImage = terrain.cover_image_url ||
    terrain.media?.find(m => m.is_cover)?.url ||
    terrain.media?.[0]?.url ||
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'

  const featureIcons = getFeatureIcons()
  const whatsappLink = getWhatsAppLink()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
    >
      <Link href={`/terrains/${terrain.slug}`}>
        {/* Image */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          <Image
            src={imageError ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop' : coverImage}
            alt={terrain.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            quality={85}
            onError={() => setImageError(true)}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Prix Badge (top-left, doré) */}
          <div className="absolute top-4 left-4">
            <div className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 font-bold text-lg rounded-full shadow-lg">
              {formatPrice(terrain.price_fcfa)}
            </div>
          </div>

          {/* Badges (top-right) */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {terrain.badges?.includes('verified') && (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                <BadgeCheck className="h-3 w-3" />
                Vérifié
              </span>
            )}
            {terrain.badges?.includes('featured') && (
              <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full shadow-lg">
                ⭐ Vedette
              </span>
            )}
            {terrain.badges?.includes('new') && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                Nouveau
              </span>
            )}
          </div>

          {/* Boutons bottom */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {/* Bouton Comparer */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isSelected(terrain.id)) {
                  removeTerrain(terrain.id)
                } else if (canAddMore) {
                  addTerrain(terrain.id)
                }
              }}
              disabled={!isSelected(terrain.id) && !canAddMore}
              className={cn(
                'p-2 rounded-full hover:bg-white transition-colors shadow-lg',
                isSelected(terrain.id)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/90 backdrop-blur-sm text-gray-700',
                !isSelected(terrain.id) && !canAddMore && 'opacity-50 cursor-not-allowed'
              )}
              title={isSelected(terrain.id) ? 'Retirer de la comparaison' : 'Comparer ce terrain'}
            >
              <CheckCircle
                className={cn(
                  'h-5 w-5 transition-colors',
                  isSelected(terrain.id) && 'fill-white'
                )}
              />
            </button>

            {/* Bouton Favori */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors',
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'
                )}
              />
            </button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Titre */}
        <Link href={`/terrains/${terrain.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors">
            {terrain.title}
          </h3>
        </Link>

        {/* Localisation */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm">
            {terrain.city}
            {terrain.neighborhood && `, ${terrain.neighborhood}`}
          </span>
          {terrain.distance_ref && (
            <span className="ml-2 text-xs text-gray-500">
              • {terrain.distance_ref}
            </span>
          )}
        </div>

        {/* Surface et Statut Légal */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span className="font-medium">{formatArea(terrain.area_sqm)}</span>
          </div>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
            📄 {getLegalLabel(terrain.legal_status)}
          </div>
        </div>

        {/* Features Icons (max 3) */}
        {featureIcons.length > 0 && (
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            {featureIcons.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 text-xs"
                  title={feature.label}
                >
                  <Icon className={cn('h-4 w-4', feature.color)} />
                  <span className="text-gray-600">{feature.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Seller Info */}
        {terrain.seller && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-600">
            <span className={cn(
              'px-2 py-1 rounded',
              terrain.seller.type === 'agency' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
            )}>
              {terrain.seller.type === 'agency' ? '🏢 Agence' : '👤 Propriétaire'}
            </span>
            <span>{terrain.seller.name}</span>
            {terrain.seller.verified && (
              <BadgeCheck className="h-3 w-3 text-green-500" />
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}

          <Link
            href={`/terrains/${terrain.slug}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <Phone className="h-4 w-4" />
            Contacter
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
