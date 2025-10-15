'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-500 to-cyan-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à trouver votre terrain idéal?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des milliers de clients satisfaits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/terrains"
                className="inline-block px-8 py-3 bg-white text-emerald-600 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-[0_5px_20px_rgba(16,185,129,0.3)]"
              >
                Voir les terrains
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-block px-8 py-3 bg-transparent text-white border-2 border-white rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                Publier une annonce
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
