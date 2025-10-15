'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2, Play, Pause } from 'lucide-react'

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
  const [guidedTourActive, setGuidedTourActive] = useState(false)
  const guidedTourInterval = useRef<NodeJS.Timeout | null>(null)

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

  // Mode visite guidée
  const startGuidedTour = () => {
    setGuidedTourActive(true)
    setLightboxOpen(true)
    setCurrentIndex(0)

    guidedTourInterval.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % images.length
        if (nextIndex === 0) {
          stopGuidedTour()
        }
        return nextIndex
      })
    }, 4000) // Change d'image toutes les 4 secondes
  }

  const stopGuidedTour = () => {
    setGuidedTourActive(false)
    if (guidedTourInterval.current) {
      clearInterval(guidedTourInterval.current)
      guidedTourInterval.current = null
    }
  }

  const toggleGuidedTour = () => {
    if (guidedTourActive) {
      stopGuidedTour()
    } else {
      startGuidedTour()
    }
  }

  // Nettoyer l'intervalle quand le lightbox se ferme
  useEffect(() => {
    if (!lightboxOpen) {
      stopGuidedTour()
    }
  }, [lightboxOpen])

  // Event listener pour les touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === ' ') {
        e.preventDefault()
        toggleGuidedTour()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, currentIndex, guidedTourActive])

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
            sizes="100vw"
            quality={90}
            priority
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Boutons d'action */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGuidedTour}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center gap-2 shadow-lg"
            >
              <Play className="h-4 w-4" />
              Visite guidée
            </motion.button>
            <button
              onClick={() => openLightbox(0)}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Maximize2 className="h-4 w-4" />
              {images.length} photos
            </button>
          </div>

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
                  sizes="(max-width: 768px) 0vw, 25vw"
                  loading="lazy"
                  quality={75}
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
            {/* Header avec contrôles */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Compteur */}
                <div className="px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </div>

                {/* Contrôles droite */}
                <div className="flex items-center gap-2">
                  {/* Bouton visite guidée */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleGuidedTour}
                    className={`px-4 py-2 rounded-lg text-white transition-all flex items-center gap-2 ${
                      guidedTourActive
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {guidedTourActive ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Arrêter
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Visite guidée
                      </>
                    )}
                  </motion.button>

                  {/* Bouton fermer */}
                  <button
                    onClick={closeLightbox}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image courante avec animation */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
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
                      alt={images[currentIndex].title || `Photo ${currentIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      quality={95}
                      priority={currentIndex === 0}
                    />
                  )}

                  {/* Titre de l'image si disponible */}
                  {images[currentIndex].title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm md:text-base text-center">
                        {images[currentIndex].title}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnails navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
                <div className="flex gap-2 max-w-full overflow-x-auto px-4 py-2 bg-black/50 rounded-lg scrollbar-hide">
                  {images.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                        index === currentIndex
                          ? 'border-emerald-500 scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={item.url}
                        alt={`Thumb ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        loading="lazy"
                        quality={60}
                      />
                      {(item.type === 'video' || item.type === 'drone') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
