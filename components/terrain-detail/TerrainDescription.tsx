interface TerrainDescriptionProps {
  description: string
  descriptionHtml?: string
  excerpt?: string
}

export default function TerrainDescription({
  description,
  descriptionHtml,
  excerpt
}: TerrainDescriptionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>

      {excerpt && (
        <p className="text-lg text-gray-700 mb-4 font-medium">
          {excerpt}
        </p>
      )}

      {descriptionHtml ? (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      ) : (
        <div className="text-gray-700 whitespace-pre-line leading-relaxed">
          {description}
        </div>
      )}
    </div>
  )
}
