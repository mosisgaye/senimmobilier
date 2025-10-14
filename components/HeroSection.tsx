'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Home, TrendingUp } from 'lucide-react'
import Image from 'next/image'

export default function HeroSection() {
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy')
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')

  const stats = [
    { value: '10K+', label: 'Propriétés' },
    { value: '5K+', label: 'Clients satisfaits' },
    { value: '15+', label: 'Villes couvertes' },
    { value: '98%', label: 'Satisfaction' },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Trouvez votre
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {' '}lieu de vie{' '}
            </span>
            idéal
          </h1>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
            Découvrez les meilleures propriétés au Sénégal. 
            Maisons, appartements et terrains adaptés à vos besoins.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-2">
            {/* Search Type Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
              <button
                onClick={() => setSearchType('buy')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  searchType === 'buy'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Acheter
              </button>
              <button
                onClick={() => setSearchType('rent')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  searchType === 'rent'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Louer
              </button>
            </div>

            {/* Search Inputs */}
            <div className="flex flex-col md:flex-row gap-2 p-2">
              <div className="flex-1 relative">
                <Home className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Que recherchez-vous?"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ville ou quartier"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                <span className="hidden md:inline">Rechercher</span>
              </motion.button>
            </div>

            {/* Quick Filters */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Recherches populaires:</span>
                {['Dakar', 'Appartement 3 pièces', 'Villa avec piscine', 'Terrain'].map((filter) => (
                  <button
                    key={filter}
                    className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}