'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation as NavigationIcon, Clock, Loader2, Layers, School, Hospital, ShoppingCart, Bus, Store, Church } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TerrainMapDetailProps {
  lat?: number
  lng?: number
  geoPolygon?: any
  city: string
  neighborhood?: string
  address?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

// Types de lieux à rechercher
const PLACE_TYPES = [
  { id: 'school', label: 'Écoles', icon: School, type: 'school', color: '#3b82f6' },
  { id: 'hospital', label: 'Hôpitaux', icon: Hospital, type: 'hospital', color: '#ef4444' },
  { id: 'supermarket', label: 'Supermarchés', icon: ShoppingCart, type: 'supermarket', color: '#10b981' },
  { id: 'transit', label: 'Transports', icon: Bus, type: 'transit_station', color: '#f59e0b' },
  { id: 'worship', label: 'Lieux de culte', icon: Church, type: 'place_of_worship', color: '#8b5cf6' },
  { id: 'pharmacy', label: 'Pharmacies', icon: Store, type: 'pharmacy', color: '#ec4899' },
]

export default function TerrainMapDetail({
  lat,
  lng,
  geoPolygon,
  city,
  neighborhood,
  address
}: TerrainMapDetailProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState('')
  const [activeLayers, setActiveLayers] = useState<string[]>([])
  const [layersOpen, setLayersOpen] = useState(false)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const hasCoordinates = lat && lng

  useEffect(() => {
    if (!hasCoordinates) return

    // Charger Google Maps Script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      // Verifier si le script est deja en cours de chargement
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Attendre que le script se charge
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle)
            initializeMap()
          }
        }, 100)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAXS1YjoJuapx4hQ_YfejsHCPUgG_wPcCc'}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => initializeMap()
      script.onerror = () => setMapError('Erreur de chargement Google Maps')
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          mapTypeId: 'hybrid', // Affiche satellite + routes
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        mapInstanceRef.current = map

        // Ajouter un marqueur principal pour le terrain
        new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: address || `${city}, ${neighborhood || ''}`,
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        })

        // Si on a un polygone, le dessiner
        if (geoPolygon && geoPolygon.coordinates) {
          try {
            const coordinates = geoPolygon.coordinates[0].map((coord: number[]) => ({
              lat: coord[1],
              lng: coord[0]
            }))

            new window.google.maps.Polygon({
              paths: coordinates,
              strokeColor: '#2563eb',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#3b82f6',
              fillOpacity: 0.35,
              map,
            })
          } catch (e) {
            console.error('Erreur polygone:', e)
          }
        }

        setMapLoaded(true)
      } catch (error) {
        console.error('Erreur initialisation map:', error)
        setMapError('Erreur initialisation carte')
      }
    }

    loadGoogleMaps()
  }, [lat, lng, hasCoordinates, geoPolygon, address, city, neighborhood])

  // Fonction pour basculer un calque
  const toggleLayer = (layerId: string) => {
    if (activeLayers.includes(layerId)) {
      // Retirer le calque
      setActiveLayers(activeLayers.filter(id => id !== layerId))
      // Retirer les marqueurs associés
      markersRef.current = markersRef.current.filter(marker => {
        if (marker.layerId === layerId) {
          marker.setMap(null)
          return false
        }
        return true
      })
    } else {
      // Ajouter le calque
      setActiveLayers([...activeLayers, layerId])
      searchNearbyPlaces(layerId)
    }
  }

  // Rechercher les lieux à proximité
  const searchNearbyPlaces = (layerId: string) => {
    if (!mapInstanceRef.current || !window.google || !lat || !lng) return

    const placeType = PLACE_TYPES.find(p => p.id === layerId)
    if (!placeType) return

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)

    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 2000, // 2km de rayon
      type: placeType.type
    }

    service.nearbySearch(request, (results: any[], status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Limiter à 10 résultats
        results.slice(0, 10).forEach((place) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapInstanceRef.current,
            title: place.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: placeType.color,
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          })

          // InfoWindow au clic
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${place.name}</h3>
                <p style="font-size: 12px; color: #666;">${place.vicinity || ''}</p>
                ${place.rating ? `<p style="font-size: 12px; margin-top: 4px;">⭐ ${place.rating}/5</p>` : ''}
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker)
          })

          // Stocker le marqueur avec son layerId
          marker.layerId = layerId
          markersRef.current.push(marker)
        })
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Localisation & Environnement</h2>

      {/* Adresse */}
      <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <div className="font-semibold text-gray-900 mb-1">Adresse</div>
            <div className="text-gray-700">
              {address || `${neighborhood ? neighborhood + ', ' : ''}${city}`}
            </div>
            {hasCoordinates && (
              <div className="text-xs text-gray-500 mt-1">
                Coordonnées: {lat?.toFixed(6)}, {lng?.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carte Google Maps */}
      <div className="mb-6 h-96 bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200">
        {hasCoordinates ? (
          <>
            <div ref={mapRef} className="w-full h-full" />

            {/* Bouton calques */}
            {mapLoaded && (
              <div className="absolute top-4 right-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLayersOpen(!layersOpen)}
                  className={`p-3 rounded-lg shadow-lg transition-all flex items-center gap-2 ${
                    layersOpen || activeLayers.length > 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Layers className="h-5 w-5" />
                  {activeLayers.length > 0 && (
                    <span className="text-xs font-semibold">({activeLayers.length})</span>
                  )}
                </motion.button>

                {/* Panel de calques */}
                <AnimatePresence>
                  {layersOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Calques disponibles
                      </h3>
                      <div className="space-y-2">
                        {PLACE_TYPES.map((placeType) => {
                          const Icon = placeType.icon
                          const isActive = activeLayers.includes(placeType.id)
                          return (
                            <button
                              key={placeType.id}
                              onClick={() => toggleLayer(placeType.id)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                                isActive
                                  ? 'bg-emerald-50 border-2 border-emerald-500'
                                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${placeType.color}20` }}
                              >
                                <Icon className="h-4 w-4" style={{ color: placeType.color }} />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {placeType.label}
                              </span>
                              {isActive && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-600" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Cliquez sur un marqueur pour plus d'infos
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Chargement de la carte...</p>
                </div>
              </div>
            )}
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <p className="text-red-600">{mapError}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Coordonnées non disponibles</p>
            </div>
          </div>
        )}
      </div>

      {/* Distances estimées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <NavigationIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Centre Dakar</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">~15 km</div>
          <div className="text-xs text-gray-500 mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            ~25 min
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span className="text-lg">🏖️</span>
            <span className="text-sm font-medium">Plage</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">~5 km</div>
          <div className="text-xs text-gray-500 mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            ~10 min
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span className="text-lg">✈️</span>
            <span className="text-sm font-medium">AIBD</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">~40 km</div>
          <div className="text-xs text-gray-500 mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            ~45 min
          </div>
        </div>
      </div>

      {/* Instructions */}
      {hasCoordinates && (
        <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-xs text-emerald-800">
            <strong>💡 Astuce:</strong> Utilisez les contrôles de la carte pour zoomer, activer Street View, ou passer en vue satellite.
          </p>
        </div>
      )}
    </div>
  )
}
