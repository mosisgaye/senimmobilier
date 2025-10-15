'use client'

import { X } from 'lucide-react'

interface ActiveFiltersChipsProps {
  filters: {
    city: string
    category: string
    legal_status: string
    min_price: string
    max_price: string
    min_area: string
    max_area: string
    features: string[]
    verified: boolean
  }
  onRemoveFilter: (key: string, value?: string) => void
  onClearAll: () => void
}

export default function ActiveFiltersChips({
  filters,
  onRemoveFilter,
  onClearAll
}: ActiveFiltersChipsProps) {
  const activeFilters: Array<{ key: string; label: string; value?: string }> = []

  // City
  if (filters.city) {
    activeFilters.push({
      key: 'city',
      label: `📍 ${filters.city}`,
    })
  }

  // Category
  if (filters.category) {
    const categoryLabels: Record<string, string> = {
      urbain: '🏙️ Urbain',
      residentiel: '🏘️ Résidentiel',
      agricole: '🌾 Agricole',
      commercial: '🏢 Commercial',
      rural: '🌳 Rural',
    }
    activeFilters.push({
      key: 'category',
      label: categoryLabels[filters.category] || filters.category,
    })
  }

  // Legal Status
  if (filters.legal_status) {
    const legalLabels: Record<string, string> = {
      titre_foncier: '📜 Titre Foncier',
      bail: '📄 Bail',
      deliberation: '📋 Délibération',
      autre: '📄 Autre',
    }
    activeFilters.push({
      key: 'legal_status',
      label: legalLabels[filters.legal_status] || filters.legal_status,
    })
  }

  // Price Range
  if (filters.min_price || filters.max_price) {
    const minPrice = filters.min_price
      ? `${(parseInt(filters.min_price) / 1000000).toFixed(0)}M`
      : '0'
    const maxPrice = filters.max_price
      ? `${(parseInt(filters.max_price) / 1000000).toFixed(0)}M`
      : '∞'
    activeFilters.push({
      key: 'price_range',
      label: `💰 ${minPrice} - ${maxPrice} FCFA`,
    })
  }

  // Area Range
  if (filters.min_area || filters.max_area) {
    const minArea = filters.min_area || '0'
    const maxArea = filters.max_area || '∞'
    activeFilters.push({
      key: 'area_range',
      label: `📏 ${minArea} - ${maxArea} m²`,
    })
  }

  // Features
  if (filters.features.length > 0) {
    const featureLabels: Record<string, string> = {
      serviced: '⚡ Viabilisé',
      bordered: '🧭 Borné',
      titre_foncier: '📜 TF Disponible',
    }
    filters.features.forEach((feature) => {
      activeFilters.push({
        key: 'features',
        label: featureLabels[feature] || feature,
        value: feature,
      })
    })
  }

  // Verified
  if (filters.verified) {
    activeFilters.push({
      key: 'verified',
      label: '✅ Vérifiées',
    })
  }

  // If no active filters, don't render anything
  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-sm font-medium text-gray-700">Filtres actifs:</span>

      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.key}-${filter.value || ''}-${index}`}
          onClick={() => onRemoveFilter(filter.key, filter.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm"
        >
          <span>{filter.label}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      ))}

      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
        Tout effacer
      </button>
    </div>
  )
}
