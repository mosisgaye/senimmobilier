'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'

interface PropertyCardProps {
  property: {
    id: string
    slug?: string
    title: string
    price_fcfa: number
    cover_image_url?: string
    media?: Array<{ url: string; is_cover: boolean; display_order: number }>
    city: string
    neighborhood?: string
    area_sqm: number
    intent: 'sale' | 'rent'
    category: string
    badges?: string[]
    seller?: {
      name: string
      verified: boolean
    }
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Récupérer les images depuis media ou cover_image_url
  const mediaImages = property.media
    ?.sort((a, b) => a.display_order - b.display_order)
    ?.map(m => m.url) || []

  const images = mediaImages.length > 0
    ? mediaImages
    : property.cover_image_url
    ? [property.cover_image_url]
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop']

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link href={`/listings/${property.slug || property.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
          {/* Image Carousel */}
          <div className="relative h-64 overflow-hidden bg-gray-100">
            {/* Images */}
            <div className="relative h-full">
              {images.map((image, index) => (
                <Image
                  key={index}
                  src={imageError ? 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' : image}
                  alt={property.title}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  )}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={85}
                  onError={() => setImageError(true)}
                />
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/60"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Like Button */}
            <button
              onClick={toggleLike}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-700"
                )}
              />
            </button>

            {/* Badge */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                {property.intent === 'sale' ? 'À vendre' : 'À louer'}
              </span>
              {property.badges?.[0] && (
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 backdrop-blur-sm rounded-full text-xs font-semibold text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
                  {property.badges[0]}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Price and Type */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(property.price_fcfa)} FCFA
                  {property.intent === 'rent' && (
                    <span className="text-sm font-normal text-gray-600">/mois</span>
                  )}
                </p>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm line-clamp-1">
                {property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}
              </span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span className="text-sm">{property.area_sqm.toLocaleString('fr-FR')} m²</span>
              </div>
              <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                {property.category}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}