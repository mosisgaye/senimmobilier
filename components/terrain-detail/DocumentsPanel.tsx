import { FileText, Download, BadgeCheck, Shield } from 'lucide-react'

interface Document {
  id: string
  url: string
  kind: string
  verified?: boolean
  title?: string
}

interface DocumentsPanelProps {
  documents: Document[]
  verified?: boolean
}

export default function DocumentsPanel({ documents, verified }: DocumentsPanelProps) {
  const getDocumentLabel = (kind: string) => {
    const labels: Record<string, { icon: string; label: string }> = {
      titre_foncier: { icon: '📄', label: 'Titre Foncier' },
      plan_bornage: { icon: '📐', label: 'Plan de Bornage' },
      deliberation: { icon: '📋', label: 'Délibération' },
      plan_situation: { icon: '🗺️', label: 'Plan de Situation' },
      autre: { icon: '📎', label: 'Autre Document' }
    }
    return labels[kind] || labels.autre
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Documents Légaux</h2>
        {verified && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Vérifiés
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Aucun document disponible pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const docInfo = getDocumentLabel(doc.kind)
            return (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <span className="text-2xl">{docInfo.icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {doc.title || docInfo.label}
                      {doc.verified && (
                        <BadgeCheck className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">PDF</div>
                  </div>
                </div>
                <Download className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </a>
            )}
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Documents sécurisés</p>
            <p className="text-blue-700">
              Tous les documents sont vérifiés par notre équipe avant publication pour garantir leur authenticité.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
