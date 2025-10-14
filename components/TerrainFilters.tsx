'use client'

import { useState, useEffect } from 'react'
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

interface TerrainFiltersProps {
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
  facets: {
    counts_by_city?: Record<string, number>
    counts_by_category?: Record<string, number>
    counts_by_legal_status?: Record<string, number>
  }
  onFilterChange: (filters: any) => void
  onReset: () => void
}

export default function TerrainFilters({ filters, facets, onFilterChange, onReset }: TerrainFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    price: true,
    surface: true,
    legal: true,
    features: true
  })

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleFeatureToggle = (feature: string) => {
    const current = localFilters.features || []
    const newFeatures = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature]
    handleChange('features', newFeatures)
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const hasActiveFilters =
    filters.city ||
    filters.category ||
    filters.legal_status ||
    filters.min_price ||
    filters.max_price ||
    filters.min_area ||
    filters.max_area ||
    filters.features.length > 0 ||
    filters.verified

  // Villes les plus populaires (basé sur les facettes)
  const topCities = facets.counts_by_city
    ? Object.entries(facets.counts_by_city)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
    : []

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full font-medium">
              Actif
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Ville */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-gray-900">📍 Localisation</h3>
          {expandedSections.location ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.location && (
          <div className="space-y-2">
            {/* Dropdown ville */}
            <select
              value={localFilters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">Toutes les villes</option>
              {topCities.map(([city, count]) => (
                <option key={city} value={city}>
                  {city} ({count})
                </option>
              ))}
            </select>

            {/* Catégorie */}
            <select
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">Toutes catégories</option>
              <option value="urbain">🏙️ Urbain</option>
              <option value="residentiel">🏘️ Résidentiel</option>
              <option value="agricole">🌾 Agricole</option>
              <option value="commercial">🏢 Commercial</option>
              <option value="rural">🌳 Rural</option>
            </select>
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-gray-900">💰 Prix (FCFA)</h3>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.price && (
          <div className="space-y-4">
            {/* Range Display */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">
                {localFilters.min_price
                  ? `${(parseInt(localFilters.min_price) / 1000000).toFixed(0)}M`
                  : '0M'}
              </span>
              <span className="text-gray-400">-</span>
              <span className="text-gray-700 font-medium">
                {localFilters.max_price
                  ? `${(parseInt(localFilters.max_price) / 1000000).toFixed(0)}M`
                  : '200M+'}
              </span>
            </div>

            {/* Range Slider */}
            <div className="px-2">
              <Slider
                range
                min={0}
                max={200000000}
                step={5000000}
                value={[
                  parseInt(localFilters.min_price) || 0,
                  parseInt(localFilters.max_price) || 200000000
                ]}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleChange('min_price', value[0] > 0 ? value[0].toString() : '')
                    handleChange('max_price', value[1] < 200000000 ? value[1].toString() : '')
                  }
                }}
                railStyle={{ backgroundColor: '#e5e7eb', height: 6 }}
                trackStyle={[{ backgroundColor: '#2563eb', height: 6 }]}
                handleStyle={[
                  { borderColor: '#2563eb', backgroundColor: 'white', width: 20, height: 20, marginTop: -7 },
                  { borderColor: '#2563eb', backgroundColor: 'white', width: 20, height: 20, marginTop: -7 }
                ]}
              />
            </div>

            {/* Number Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Min (FCFA)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters.min_price}
                  onChange={(e) => handleChange('min_price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Max (FCFA)</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={localFilters.max_price}
                  onChange={(e) => handleChange('max_price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Quick price filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleChange('min_price', '')
                  handleChange('max_price', '10000000')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                &lt; 10M
              </button>
              <button
                onClick={() => {
                  handleChange('min_price', '10000000')
                  handleChange('max_price', '30000000')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                10M - 30M
              </button>
              <button
                onClick={() => {
                  handleChange('min_price', '30000000')
                  handleChange('max_price', '50000000')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                30M - 50M
              </button>
              <button
                onClick={() => {
                  handleChange('min_price', '50000000')
                  handleChange('max_price', '')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                &gt; 50M
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Surface */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => toggleSection('surface')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-gray-900">📏 Surface (m²)</h3>
          {expandedSections.surface ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.surface && (
          <div className="space-y-4">
            {/* Range Display */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">
                {localFilters.min_area || '0'} m²
              </span>
              <span className="text-gray-400">-</span>
              <span className="text-gray-700 font-medium">
                {localFilters.max_area || '5000+'} m²
              </span>
            </div>

            {/* Range Slider */}
            <div className="px-2">
              <Slider
                range
                min={0}
                max={5000}
                step={100}
                value={[
                  parseInt(localFilters.min_area) || 0,
                  parseInt(localFilters.max_area) || 5000
                ]}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    handleChange('min_area', value[0] > 0 ? value[0].toString() : '')
                    handleChange('max_area', value[1] < 5000 ? value[1].toString() : '')
                  }
                }}
                railStyle={{ backgroundColor: '#e5e7eb', height: 6 }}
                trackStyle={[{ backgroundColor: '#10b981', height: 6 }]}
                handleStyle={[
                  { borderColor: '#10b981', backgroundColor: 'white', width: 20, height: 20, marginTop: -7 },
                  { borderColor: '#10b981', backgroundColor: 'white', width: 20, height: 20, marginTop: -7 }
                ]}
              />
            </div>

            {/* Number Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Min (m²)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters.min_area}
                  onChange={(e) => handleChange('min_area', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Max (m²)</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={localFilters.max_area}
                  onChange={(e) => handleChange('max_area', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Quick area filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleChange('min_area', '')
                  handleChange('max_area', '300')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
              >
                &lt; 300m²
              </button>
              <button
                onClick={() => {
                  handleChange('min_area', '300')
                  handleChange('max_area', '600')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
              >
                300 - 600m²
              </button>
              <button
                onClick={() => {
                  handleChange('min_area', '600')
                  handleChange('max_area', '1000')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
              >
                600 - 1000m²
              </button>
              <button
                onClick={() => {
                  handleChange('min_area', '1000')
                  handleChange('max_area', '')
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
              >
                &gt; 1000m²
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statut Légal */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => toggleSection('legal')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-gray-900">📄 Statut Légal</h3>
          {expandedSections.legal ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.legal && (
          <div className="space-y-2">
            {[
              { value: 'titre_foncier', label: 'Titre Foncier', count: facets.counts_by_legal_status?.titre_foncier },
              { value: 'bail', label: 'Bail', count: facets.counts_by_legal_status?.bail },
              { value: 'deliberation', label: 'Délibération', count: facets.counts_by_legal_status?.deliberation },
              { value: 'autre', label: 'Autre', count: facets.counts_by_legal_status?.autre }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="legal_status"
                  value={option.value}
                  checked={localFilters.legal_status === option.value}
                  onChange={(e) => handleChange('legal_status', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                {option.count && (
                  <span className="text-xs text-gray-500">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Features (Caractéristiques) */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-gray-900">✨ Caractéristiques</h3>
          {expandedSections.features ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.features && (
          <div className="space-y-2">
            {/* Features basées sur la DB RÉELLE */}
            {[
              { value: 'serviced', label: '⚡ Viabilisé', description: 'Eau + Électricité' },
              { value: 'bordered', label: '🧭 Borné', description: 'Limites définies' },
              { value: 'titre_foncier', label: '📜 TF Disponible', description: 'Titre foncier' }
            ].map(feature => (
              <label key={feature.value} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={localFilters.features.includes(feature.value)}
                  onChange={() => handleFeatureToggle(feature.value)}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-900 block">{feature.label}</span>
                  <span className="text-xs text-gray-500">{feature.description}</span>
                </div>
              </label>
            ))}

            {/* Vérifié */}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={localFilters.verified}
                onChange={(e) => handleChange('verified', e.target.checked)}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">✅ Annonces vérifiées uniquement</span>
            </label>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg"
      >
        Appliquer les filtres
      </button>
    </div>
  )
}
