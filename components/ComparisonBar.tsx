'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { useComparison } from '@/lib/ComparisonContext'
import Link from 'next/link'

interface ComparisonBarProps {
  terrains: any[]
}

export default function ComparisonBar({ terrains }: ComparisonBarProps) {
  const { selectedTerrains, removeTerrain, clearComparison } = useComparison()

  const selectedTerrainsData = terrains.filter((t) =>
    selectedTerrains.includes(t.id)
  )

  if (selectedTerrains.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-emerald-600 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Selected Terrains */}
            <div className="flex items-center gap-4 flex-1 overflow-x-auto">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-semibold text-gray-900">
                  Comparer ({selectedTerrains.length}/3)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {selectedTerrainsData.map((terrain) => (
                  <div
                    key={terrain.id}
                    className="relative group flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                        {terrain.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {terrain.city} • {terrain.area_sqm}m²
                      </p>
                    </div>
                    <button
                      onClick={() => removeTerrain(terrain.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={clearComparison}
                className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 font-medium transition-colors"
              >
                Effacer tout
              </button>

              <Link
                href={`/compare?ids=${selectedTerrains.join(',')}`}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-lg"
              >
                Comparer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
