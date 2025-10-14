export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Tailwind CSS</h1>
        <p className="text-gray-600 mb-6">Si vous voyez ce design, Tailwind fonctionne correctement!</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500 text-white p-4 rounded-lg text-center">Rouge</div>
          <div className="bg-green-500 text-white p-4 rounded-lg text-center">Vert</div>
          <div className="bg-blue-500 text-white p-4 rounded-lg text-center">Bleu</div>
        </div>
        <button className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          Bouton avec effet
        </button>
      </div>
    </div>
  )
}