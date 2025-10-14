'use client'

import { motion } from 'framer-motion'
import { Shield, Users, TrendingUp, Award } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: 'Transactions Sécurisées',
      description: 'Vos transactions sont protégées et vérifiées pour votre tranquillité.',
    },
    {
      icon: Users,
      title: 'Agents Certifiés',
      description: 'Travaillez avec des professionnels vérifiés et expérimentés.',
    },
    {
      icon: TrendingUp,
      title: 'Meilleurs Prix',
      description: 'Accédez aux meilleures offres du marché immobilier sénégalais.',
    },
    {
      icon: Award,
      title: 'Service Premium',
      description: "Bénéficiez d'un accompagnement personnalisé tout au long.",
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Fatimmo?
          </h2>
          <p className="text-lg text-gray-600">
            La plateforme immobilière de confiance au Sénégal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
