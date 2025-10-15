'use client'

import {
  MapPin,
  Ruler,
  Shield,
  Tag,
  CheckCircle2,
  Zap,
  TrendingUp,
  Award,
  Target,
  Home
} from 'lucide-react'
import { motion } from 'framer-motion'

interface FeaturesSidebarProps {
  terrain: {
    price_fcfa: number
    area_sqm: number
    city: string
    neighborhood?: string
    category: string
    legal_status: string
    verified?: boolean
    features?: string[]
    proximity?: Record<string, any>
  }
}

export default function FeaturesSidebar({ terrain }: FeaturesSidebarProps) {
  // Formater le prix
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(terrain.price_fcfa)
  const pricePerSqm = Math.round(terrain.price_fcfa / terrain.area_sqm)
  const formattedPricePerSqm = new Intl.NumberFormat('fr-FR').format(pricePerSqm)

  // Traduire le statut légal
  const legalStatusLabels: Record<string, string> = {
    'titre_foncier': 'Titre Foncier',
    'deliberation': 'Délibération',
    'bail': 'Bail',
    'autres': 'Autres',
  }

  // Traduire la catégorie
  const categoryLabels: Record<string, string> = {
    'residential': 'Résidentiel',
    'commercial': 'Commercial',
    'agricultural': 'Agricole',
    'industrial': 'Industriel',
    'mixed': 'Mixte',
  }

  // Extraire les atouts du terrain
  const atouts = []

  if (terrain.verified) {
    atouts.push({ icon: Shield, label: 'Terrain vérifié', color: 'text-green-600' })
  }

  if (terrain.legal_status === 'titre_foncier') {
    atouts.push({ icon: Award, label: 'Titre foncier sécurisé', color: 'text-emerald-600' })
  }

  if (terrain.features && terrain.features.length > 0) {
    if (terrain.features.includes('electricity')) {
      atouts.push({ icon: Zap, label: 'Électricité disponible', color: 'text-yellow-600' })
    }
    if (terrain.features.includes('water')) {
      atouts.push({ icon: CheckCircle2, label: 'Eau courante', color: 'text-cyan-600' })
    }
    if (terrain.features.includes('road_access')) {
      atouts.push({ icon: Target, label: 'Accès routier', color: 'text-purple-600' })
    }
  }

  if (pricePerSqm < 50000) {
    atouts.push({ icon: TrendingUp, label: 'Excellent rapport qualité/prix', color: 'text-orange-600' })
  }

  if (terrain.proximity && Object.keys(terrain.proximity).length > 0) {
    atouts.push({ icon: Home, label: 'Proche des commodités', color: 'text-indigo-600' })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* En-tête avec prix */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
        <div className="text-center">
          <p className="text-sm font-medium opacity-90 mb-1">Prix du terrain</p>
          <p className="text-3xl font-bold mb-2">{formattedPrice} FCFA</p>
          <p className="text-sm opacity-80">{formattedPricePerSqm} FCFA/m²</p>
        </div>
      </div>

      {/* Caractéristiques principales */}
      <div className="p-6 space-y-4 border-b">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Caractéristiques</h3>

        <div className="space-y-3">
          {/* Surface */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Ruler className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Surface</p>
              <p className="text-sm font-bold text-gray-900">{terrain.area_sqm} m²</p>
            </div>
          </motion.div>

          {/* Localisation */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Localisation</p>
              <p className="text-sm font-bold text-gray-900">
                {terrain.city}
                {terrain.neighborhood && `, ${terrain.neighborhood}`}
              </p>
            </div>
          </motion.div>

          {/* Catégorie */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Catégorie</p>
              <p className="text-sm font-bold text-gray-900">
                {categoryLabels[terrain.category] || terrain.category}
              </p>
            </div>
          </motion.div>

          {/* Statut légal */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Statut légal</p>
              <p className="text-sm font-bold text-gray-900">
                {legalStatusLabels[terrain.legal_status] || terrain.legal_status}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Atouts */}
      {atouts.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Atouts principaux</h3>

          <div className="space-y-2">
            {atouts.map((atout, index) => {
              const Icon = atout.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Icon className={`h-5 w-5 ${atout.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-700 font-medium">{atout.label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Call to action */}
      <div className="p-6 bg-gray-50 border-t">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          Réserver une visite
        </motion.button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Contactez-nous pour organiser une visite
        </p>
      </div>
    </div>
  )
}
