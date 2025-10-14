'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ComparisonContextType {
  selectedTerrains: string[]
  addTerrain: (id: string) => void
  removeTerrain: (id: string) => void
  clearComparison: () => void
  isSelected: (id: string) => boolean
  canAddMore: boolean
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedTerrains, setSelectedTerrains] = useState<string[]>([])
  const MAX_COMPARE = 3

  const addTerrain = (id: string) => {
    if (selectedTerrains.length < MAX_COMPARE && !selectedTerrains.includes(id)) {
      setSelectedTerrains([...selectedTerrains, id])
    }
  }

  const removeTerrain = (id: string) => {
    setSelectedTerrains(selectedTerrains.filter((t) => t !== id))
  }

  const clearComparison = () => {
    setSelectedTerrains([])
  }

  const isSelected = (id: string) => {
    return selectedTerrains.includes(id)
  }

  const canAddMore = selectedTerrains.length < MAX_COMPARE

  return (
    <ComparisonContext.Provider
      value={{
        selectedTerrains,
        addTerrain,
        removeTerrain,
        clearComparison,
        isSelected,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
}
