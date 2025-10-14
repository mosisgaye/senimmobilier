'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2, Play } from 'lucide-react'

interface Media {
  id: string
  url: string
  type: 'image' | 'video' | 'drone' | 'panorama'
  is_cover?: boolean
  title?: string
}

interface TerrainGalleryProps {
  media: Media[]
  coverImage: string
  title: string
}

export default function TerrainGallery({ media, coverImage, title }: TerrainGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Si pas de médias, utiliser l'image de couverture
  const images = media.length > 0 ? media : [{ id: '1', url: coverImage, type: 'image' as const }]

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Ajouter event listener pour les touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'ArrowLeft') goToPrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, currentIndex])

  return (
    <>
      {/* Galerie principale */}
      <div className="relative bg-black">
        {/* Image principale */}
        <div className="relative h-[400px] md:h-[600px] w-full">
          <Image
            src={images[0].url}
            alt={title}
            fill
            className="object-cover"
            priority
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Bouton "Voir toutes les photos" */}
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Maximize2 className="h-4 w-4" />
            Voir les {images.length} photos
          </button>

          {/* Badge vidéo si présent */}
          {images.some(m => m.type === 'video' || m.type === 'drone') && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium flex items-center gap-1">
              <Play className="h-3 w-3" />
              Vidéo disponible
            </div>
          )}
        </div>

        {/* Thumbnails - Desktop */}
        {images.length > 1 && (
          <div className="hidden md:grid grid-cols-4 gap-2 p-2 bg-black">
            {images.slice(1, 5).map((item, index) => (
              <button
                key={item.id}
                onClick={() => openLightbox(index + 1)}
                className="relative h-24 overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
              >
                <Image
                  src={item.url}
                  alt={`Photo ${index + 2}`}
                  fill
                  className="object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          >
            {/* Bouton fermer */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Compteur */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm z-10">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Image courante */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4">
              {images[currentIndex].type === 'video' || images[currentIndex].type === 'drone' ? (
                <video
                  src={images[currentIndex].url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image
                  src={images[currentIndex].url}
                  alt={`Photo ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            {/* Thumbnails navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 bg-black/50 rounded-lg">
                {images.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-white scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={item.url}
                      alt={`Thumb ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
