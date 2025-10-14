import { Zap, Compass, BadgeCheck, Waves, Navigation, Droplet, Grid3x3, Mountain } from 'lucide-react'

interface TerrainFeaturesProps {
  features?: {
    bordered?: boolean
    serviced?: boolean
    title_deed_available?: boolean
    soil_type?: string
    zoning?: string
    slope?: string
  }
  proximity?: Record<string, string>
  category: string
  legalStatus: string
  areaSqm: number
}

export default function TerrainFeatures({
  features = {},
  proximity = {},
  category,
  legalStatus,
  areaSqm
}: TerrainFeaturesProps) {
  // Mapper les features vers les icônes et labels
  const featuresList = []

  if (features.serviced) {
    featuresList.push({
      icon: Zap,
      label: 'Viabilisé',
      description: 'Eau + Électricité disponibles',
      color: 'text-yellow-600 bg-yellow-50'
    })
  }

  if (features.bordered) {
    featuresList.push({
      icon: Compass,
      label: 'Borné',
      description: 'Limites définies et bornées',
      color: 'text-green-600 bg-green-50'
    })
  }

  if (features.title_deed_available) {
    featuresList.push({
      icon: BadgeCheck,
      label: 'Titre Foncier Disponible',
      description: 'Documents légaux prêts',
      color: 'text-blue-600 bg-blue-50'
    })
  }

  if (proximity.beach || proximity.sea) {
    featuresList.push({
      icon: Waves,
      label: 'Proche de la Mer',
      description: proximity.beach || proximity.sea,
      color: 'text-cyan-600 bg-cyan-50'
    })
  }

  if (features.slope === 'flat') {
    featuresList.push({
      icon: Navigation,
      label: 'Terrain Plat',
      description: 'Accès facile',
      color: 'text-gray-600 bg-gray-50'
    })
  } else if (features.slope) {
    featuresList.push({
      icon: Mountain,
      label: 'Pente',
      description: features.slope,
      color: 'text-gray-600 bg-gray-50'
    })
  }

  if (features.soil_type) {
    featuresList.push({
      icon: Grid3x3,
      label: 'Type de Sol',
      description: features.soil_type,
      color: 'text-amber-600 bg-amber-50'
    })
  }

  if (features.zoning) {
    const zoningLabels: Record<string, string> = {
      residential: 'Zone Résidentielle',
      commercial: 'Zone Commerciale',
      agricultural: 'Zone Agricole',
      industrial: 'Zone Industrielle'
    }
    featuresList.push({
      icon: Grid3x3,
      label: 'Zonage',
      description: zoningLabels[features.zoning] || features.zoning,
      color: 'text-purple-600 bg-purple-50'
    })
  }

  // Commodités à proximité
  const proximityList = Object.entries(proximity)
    .filter(([key]) => key !== 'beach' && key !== 'sea')
    .map(([key, value]) => {
      const labels: Record<string, string> = {
        school: '🏫 École',
        hospital: '🏥 Hôpital',
        market: '🛒 Marché',
        mosque: '🕌 Mosquée',
        bus_station: '🚌 Arrêt de bus',
        road: '🛣️ Route principale'
      }
      return {
        label: labels[key] || key,
        distance: value
      }
    })

  if (featuresList.length === 0 && proximityList.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques & Atouts</h2>

      {/* Features Grid */}
      {featuresList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {featuresList.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border ${feature.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {feature.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {feature.description}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Proximités */}
      {proximityList.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">À proximité</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {proximityList.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span>{item.label}</span>
                <span className="text-gray-500">• {item.distance}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
