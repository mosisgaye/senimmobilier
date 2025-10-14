'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, CheckCircle, Award } from 'lucide-react'

interface StatsSectionProps {
  stats: {
    totalListings: number
    totalSellers: number
    verifiedListings: number
    satisfiedClients: number
  }
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const statsData = [
    {
      icon: TrendingUp,
      value: stats.totalListings.toLocaleString('fr-FR'),
      label: 'Terrains Disponibles',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: CheckCircle,
      value: stats.verifiedListings.toLocaleString('fr-FR'),
      label: 'Terrains Vérifiés',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Users,
      value: stats.totalSellers.toLocaleString('fr-FR'),
      label: 'Vendeurs de Confiance',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Award,
      value: `${stats.satisfiedClients.toLocaleString('fr-FR')}+`,
      label: 'Clients Satisfaits',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} ${stat.color} mb-4`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
