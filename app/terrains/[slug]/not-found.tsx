import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function TerrainNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🏞️</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Terrain non trouvé
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Désolé, ce terrain n&apos;existe pas ou n&apos;est plus disponible.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/terrains"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <Search className="h-5 w-5" />
            Voir tous les terrains
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <Home className="h-5 w-5" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
