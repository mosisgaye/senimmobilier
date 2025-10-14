'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation as NavigationIcon, Clock, Loader2 } from 'lucide-react'

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

        // Ajouter un marqueur
        new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: address || `${city}, ${neighborhood || ''}`,
          animation: window.google.maps.Animation.DROP,
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

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Localisation & Environnement</h2>

      {/* Adresse */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-semibold text-gray-900 mb-1">Adresse</div>
            <div className="text-gray-700">
              {address || `${neighborhood ? neighborhood + ', ' : ''}${city}`}
            </div>
            {hasCoordinates && (
              <div className="text-xs text-gray-500 mt-1">
                Coordonnees: {lat?.toFixed(6)}, {lng?.toFixed(6)}
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
            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-2" />
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
              <p className="text-gray-500">Coordonnees non disponibles</p>
            </div>
          </div>
        )}
      </div>

      {/* Distances estimees */}
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
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Astuce:</strong> Utilisez les controles de la carte pour zoomer, activer Street View, ou passer en vue satellite.
          </p>
        </div>
      )}
    </div>
  )
}
