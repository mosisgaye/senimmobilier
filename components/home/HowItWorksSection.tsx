'use client'

import { motion } from 'framer-motion'
import { Search, FileCheck, Key } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      title: 'Recherchez',
      description: 'Parcourez notre large sélection de terrains titrés et vérifiés dans toutes les régions du Sénégal.',
      number: '01',
    },
    {
      icon: FileCheck,
      title: 'Vérifiez',
      description: 'Consultez les documents légaux, les photos et contactez directement les vendeurs pour plus d\'informations.',
      number: '02',
    },
    {
      icon: Key,
      title: 'Achetez',
      description: 'Finalisez votre achat en toute sécurité avec l\'accompagnement de nos experts immobiliers certifiés.',
      number: '03',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez votre terrain idéal en 3 étapes simples
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connector Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-300 to-primary-200" />
              )}

              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 mb-6">
                  <step.icon className="h-10 w-10" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
