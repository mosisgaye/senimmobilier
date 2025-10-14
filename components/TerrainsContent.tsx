'use client'

import { useRouter } from 'next/navigation'
import TerrainCard from '@/components/TerrainCard'
import TerrainFilters from '@/components/TerrainFilters'
import ActiveFiltersChips from '@/components/ActiveFiltersChips'
import ComparisonBar from '@/components/ComparisonBar'

interface TerrainsContentProps {
  initialTerrains: any[]
  initialTotalCount: number
  initialFacets: any
  initialPage: number
  totalPages: number
  searchParams: any
}

export default function TerrainsContent({
  initialTerrains,
  initialTotalCount,
  initialFacets,
  initialPage,
  totalPages,
  searchParams
}: TerrainsContentProps) {
  const router = useRouter()

  // Extraire les filtres depuis searchParams
  const filters = {
    city: searchParams.city || '',
    category: searchParams.category || '',
    legal_status: searchParams.legal_status || '',
    min_price: searchParams.min_price || '',
    max_price: searchParams.max_price || '',
    min_area: searchParams.min_area || '',
    max_area: searchParams.max_area || '',
    features: searchParams.features?.split(',').filter(Boolean) || [],
    verified: searchParams.verified === 'true',
  }

  const sort = searchParams.sort || 'newest'

  const handleFilterChange = (newFilters: any) => {
    updateURL(newFilters, sort, 1)
  }

  const handleSortChange = (newSort: string) => {
    updateURL(filters, newSort, 1)
  }

  const handlePageChange = (newPage: number) => {
    updateURL(filters, sort, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateURL = (filters: any, sort: string, page: number) => {
    const params = new URLSearchParams()

    if (filters.city) params.set('city', filters.city)
    if (filters.category) params.set('category', filters.category)
    if (filters.legal_status) params.set('legal_status', filters.legal_status)
    if (filters.min_price) params.set('min_price', filters.min_price)
    if (filters.max_price) params.set('max_price', filters.max_price)
    if (filters.min_area) params.set('min_area', filters.min_area)
    if (filters.max_area) params.set('max_area', filters.max_area)
    if (filters.features.length > 0) params.set('features', filters.features.join(','))
    if (filters.verified) params.set('verified', 'true')
    if (sort !== 'newest') params.set('sort', sort)
    if (page > 1) params.set('page', page.toString())

    router.push(`/terrains?${params.toString()}`)
  }

  const resetFilters = () => {
    router.push('/terrains')
  }

  const handleRemoveFilter = (key: string, value?: string) => {
    const newFilters = { ...filters }

    if (key === 'price_range') {
      newFilters.min_price = ''
      newFilters.max_price = ''
    } else if (key === 'area_range') {
      newFilters.min_area = ''
      newFilters.max_area = ''
    } else if (key === 'features' && value) {
      newFilters.features = newFilters.features.filter((f) => f !== value)
    } else if (key === 'verified') {
      newFilters.verified = false
    } else {
      newFilters[key as keyof typeof newFilters] = '' as any
    }

    updateURL(newFilters, sort, 1)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar Filters */}
        <aside className="lg:w-80 flex-shrink-0">
          <TerrainFilters
            filters={filters}
            facets={initialFacets}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Active Filters Chips */}
          <ActiveFiltersChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={resetFilters}
          />

          {/* Sort & Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{initialTotalCount}</span> terrains trouvés
            </p>

            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="area_asc">Surface croissante</option>
              <option value="area_desc">Surface décroissante</option>
            </select>
          </div>

          {/* Results Grid */}
          {initialTerrains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {initialTerrains.map((terrain) => (
                <TerrainCard key={terrain.id} terrain={terrain} />
              ))}
            </div>
          ) : (
            /* Zero State */
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Aucun terrain trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos filtres de recherche
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(initialPage - 1)}
                disabled={initialPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= initialPage - 2 && pageNum <= initialPage + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        pageNum === initialPage
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                } else if (pageNum === initialPage - 3 || pageNum === initialPage + 3) {
                  return <span key={pageNum}>...</span>
                }
                return null
              })}

              <button
                onClick={() => handlePageChange(initialPage + 1)}
                disabled={initialPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Comparison Bar */}
      <ComparisonBar terrains={initialTerrains} />
    </section>
  )
}
