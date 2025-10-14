import TerrainCard from '@/components/TerrainCard'

interface SimilarTerrainsProps {
  terrains: any[]
  currentCity: string
}

export default function SimilarTerrains({ terrains, currentCity }: SimilarTerrainsProps) {
  if (terrains.length === 0) return null

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Terrains Similaires
        </h2>
        <p className="text-gray-600">
          Autres terrains à {currentCity} qui pourraient vous intéresser
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {terrains.map((terrain) => (
          <TerrainCard key={terrain.id} terrain={terrain} />
        ))}
      </div>
    </div>
  )
}
