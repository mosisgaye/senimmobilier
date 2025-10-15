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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
            {hasActiveFilters && (
              <span className="text-xs text-emerald-600 font-medium">
                {Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length} actif(s)
              </span>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors font-medium"
          >
            <X className="h-4 w-4" />
            Tout effacer
          </button>
        )}
      </div>

      {/* Ville */}
      <div className="mb-5">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span className="text-xl">📍</span>
            Localisation
          </h3>
          <div className="p-1 group-hover:bg-emerald-100 rounded transition-colors">
            {expandedSections.location ? (
              <ChevronUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {expandedSections.location && (
          <div className="space-y-3 pl-2">
            {/* Dropdown ville */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                Ville
              </label>
              <select
                value={localFilters.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-900 bg-white hover:border-emerald-300 transition-colors"
              >
                <option value="">Toutes les villes</option>
                {topCities.map(([city, count]) => (
                  <option key={city} value={city}>
                    {city} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                Catégorie
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-gray-900 bg-white hover:border-emerald-300 transition-colors"
              >
                <option value="">Toutes catégories</option>
                <option value="urbain">🏙️ Urbain</option>
                <option value="residentiel">🏘️ Résidentiel</option>
                <option value="agricole">🌾 Agricole</option>
                <option value="commercial">🏢 Commercial</option>
                <option value="rural">🌳 Rural</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="mb-5 pb-5 border-b-2 border-gray-100">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span className="text-xl">💰</span>
            Prix (FCFA)
          </h3>
          <div className="p-1 group-hover:bg-emerald-100 rounded transition-colors">
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {expandedSections.price && (
          <div className="space-y-4 pl-2">
            {/* Range Display */}
            <div className="flex items-center justify-between px-2 py-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border-2 border-emerald-100">
              <div className="text-center flex-1">
                <span className="text-xs font-semibold text-gray-600 block mb-1">Min</span>
                <span className="text-lg font-bold text-emerald-700">
                  {localFilters.min_price
                    ? `${(parseInt(localFilters.min_price) / 1000000).toFixed(0)}M`
                    : '0M'}
                </span>
              </div>
              <div className="text-gray-400 font-bold px-2">→</div>
              <div className="text-center flex-1">
                <span className="text-xs font-semibold text-gray-600 block mb-1">Max</span>
                <span className="text-lg font-bold text-cyan-700">
                  {localFilters.max_price
                    ? `${(parseInt(localFilters.max_price) / 1000000).toFixed(0)}M`
                    : '200M+'}
                </span>
              </div>
            </div>

            {/* Range Slider */}
            <div className="px-2 py-4">
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
                railStyle={{ backgroundColor: '#e5e7eb', height: 8, borderRadius: 4 }}
                trackStyle={[{ backgroundColor: '#10b981', height: 8, borderRadius: 4 }]}
                handleStyle={[
                  { borderColor: '#10b981', borderWidth: 3, backgroundColor: 'white', width: 24, height: 24, marginTop: -8, boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' },
                  { borderColor: '#06b6d4', borderWidth: 3, backgroundColor: 'white', width: 24, height: 24, marginTop: -8, boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)' }
                ]}
              />
            </div>

            {/* Quick price filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleChange('min_price', '')
                  handleChange('max_price', '10000000')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-emerald-200 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
              >
                &lt; 10M
              </button>
              <button
                onClick={() => {
                  handleChange('min_price', '10000000')
                  handleChange('max_price', '30000000')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-emerald-200 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
              >
                10M - 30M
              </button>
              <button
                onClick={() => {
                  handleChange('min_price', '30000000')
                  handleChange('max_price', '50000000')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-emerald-200 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
              >
                30M - 50M
              </button>
              <button
                onClick={() => {
                  handleChange('min_price', '50000000')
                  handleChange('max_price', '')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-emerald-200 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
              >
                &gt; 50M
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Surface */}
      <div className="mb-5 pb-5 border-b-2 border-gray-100">
        <button
          onClick={() => toggleSection('surface')}
          className="flex items-center justify-between w-full mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span className="text-xl">📏</span>
            Surface (m²)
          </h3>
          <div className="p-1 group-hover:bg-emerald-100 rounded transition-colors">
            {expandedSections.surface ? (
              <ChevronUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {expandedSections.surface && (
          <div className="space-y-4 pl-2">
            {/* Range Display */}
            <div className="flex items-center justify-between px-2 py-3 bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-xl border-2 border-cyan-100">
              <div className="text-center flex-1">
                <span className="text-xs font-semibold text-gray-600 block mb-1">Min</span>
                <span className="text-lg font-bold text-cyan-700">
                  {localFilters.min_area || '0'} m²
                </span>
              </div>
              <div className="text-gray-400 font-bold px-2">→</div>
              <div className="text-center flex-1">
                <span className="text-xs font-semibold text-gray-600 block mb-1">Max</span>
                <span className="text-lg font-bold text-emerald-700">
                  {localFilters.max_area || '5000+'} m²
                </span>
              </div>
            </div>

            {/* Range Slider */}
            <div className="px-2 py-4">
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
                railStyle={{ backgroundColor: '#e5e7eb', height: 8, borderRadius: 4 }}
                trackStyle={[{ backgroundColor: '#06b6d4', height: 8, borderRadius: 4 }]}
                handleStyle={[
                  { borderColor: '#06b6d4', borderWidth: 3, backgroundColor: 'white', width: 24, height: 24, marginTop: -8, boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)' },
                  { borderColor: '#10b981', borderWidth: 3, backgroundColor: 'white', width: 24, height: 24, marginTop: -8, boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }
                ]}
              />
            </div>

            {/* Quick area filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleChange('min_area', '')
                  handleChange('max_area', '300')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-cyan-200 rounded-xl hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all shadow-sm"
              >
                &lt; 300m²
              </button>
              <button
                onClick={() => {
                  handleChange('min_area', '300')
                  handleChange('max_area', '600')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-cyan-200 rounded-xl hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all shadow-sm"
              >
                300 - 600m²
              </button>
              <button
                onClick={() => {
                  handleChange('min_area', '600')
                  handleChange('max_area', '1000')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-cyan-200 rounded-xl hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all shadow-sm"
              >
                600 - 1000m²
              </button>
              <button
                onClick={() => {
                  handleChange('min_area', '1000')
                  handleChange('max_area', '')
                }}
                className="px-4 py-2 text-xs font-semibold border-2 border-cyan-200 rounded-xl hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all shadow-sm"
              >
                &gt; 1000m²
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statut Légal */}
      <div className="mb-5 pb-5 border-b-2 border-gray-100">
        <button
          onClick={() => toggleSection('legal')}
          className="flex items-center justify-between w-full mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span className="text-xl">📄</span>
            Statut Légal
          </h3>
          <div className="p-1 group-hover:bg-emerald-100 rounded transition-colors">
            {expandedSections.legal ? (
              <ChevronUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {expandedSections.legal && (
          <div className="space-y-2 pl-2">
            {[
              { value: 'titre_foncier', label: 'Titre Foncier', icon: '📜', count: facets.counts_by_legal_status?.titre_foncier },
              { value: 'bail', label: 'Bail', icon: '📋', count: facets.counts_by_legal_status?.bail },
              { value: 'deliberation', label: 'Délibération', icon: '📑', count: facets.counts_by_legal_status?.deliberation },
              { value: 'autre', label: 'Autre', icon: '📎', count: facets.counts_by_legal_status?.autre }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl border-2 border-transparent hover:border-emerald-200 transition-all group">
                <input
                  type="radio"
                  name="legal_status"
                  value={option.value}
                  checked={localFilters.legal_status === option.value}
                  onChange={(e) => handleChange('legal_status', e.target.value)}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-semibold text-gray-900 flex-1 group-hover:text-emerald-700">{option.label}</span>
                {option.count && (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {option.count}
                  </span>
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
          className="flex items-center justify-between w-full mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <span className="text-xl">✨</span>
            Caractéristiques
          </h3>
          <div className="p-1 group-hover:bg-emerald-100 rounded transition-colors">
            {expandedSections.features ? (
              <ChevronUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </button>

        {expandedSections.features && (
          <div className="space-y-2 pl-2">
            {/* Features basées sur la DB RÉELLE */}
            {[
              { value: 'serviced', label: 'Viabilisé', icon: '⚡', description: 'Eau + Électricité', color: 'yellow' },
              { value: 'bordered', label: 'Borné', icon: '🧭', description: 'Limites définies', color: 'emerald' },
              { value: 'titre_foncier', label: 'TF Disponible', icon: '📜', description: 'Titre foncier', color: 'cyan' }
            ].map(feature => (
              <label key={feature.value} className="flex items-start gap-3 cursor-pointer hover:bg-emerald-50 p-3 rounded-xl border-2 border-transparent hover:border-emerald-200 transition-all group">
                <input
                  type="checkbox"
                  checked={localFilters.features.includes(feature.value)}
                  onChange={() => handleFeatureToggle(feature.value)}
                  className="w-5 h-5 mt-0.5 text-emerald-600 focus:ring-emerald-500 focus:ring-2 rounded"
                />
                <span className="text-lg">{feature.icon}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block group-hover:text-emerald-700">{feature.label}</span>
                  <span className="text-xs text-gray-600">{feature.description}</span>
                </div>
              </label>
            ))}

            {/* Vérifié */}
            <label className="flex items-center gap-3 cursor-pointer hover:bg-green-50 p-3 rounded-xl border-2 border-transparent hover:border-green-200 transition-all group">
              <input
                type="checkbox"
                checked={localFilters.verified}
                onChange={(e) => handleChange('verified', e.target.checked)}
                className="w-5 h-5 text-green-600 focus:ring-green-500 focus:ring-2 rounded"
              />
              <span className="text-lg">✅</span>
              <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700">Annonces vérifiées uniquement</span>
            </label>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold text-base hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="flex items-center justify-center gap-2">
          <Filter className="h-5 w-5" />
          Appliquer les filtres
        </span>
      </button>
    </div>
  )
}
