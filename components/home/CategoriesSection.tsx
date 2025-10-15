'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function CategoriesSection() {
  const categories = [
    {
      name: 'Terrains Résidentiels',
      count: '450',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
      href: '/terrains?category=residentiel',
    },
    {
      name: 'Terrains Commerciaux',
      count: '180',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      href: '/terrains?category=commercial',
    },
    {
      name: 'Terrains Agricoles',
      count: '120',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
      href: '/terrains?category=agricole',
    },
    {
      name: 'Terrains Ruraux',
      count: '90',
      image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=300&fit=crop',
      href: '/terrains?category=rural',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explorer par catégorie
          </h2>
          <p className="text-lg text-gray-600">Trouvez exactement ce que vous cherchez</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link href={category.href} className="relative group cursor-pointer block">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    loading="lazy"
                    quality={80}
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                    <p className="text-white/80 text-sm">{category.count} annonces</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
