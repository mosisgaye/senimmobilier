'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10" />
        <Image
          src="/images/hero.png"
          alt="Hero Background - SenImmobilier"
          fill
          className="object-cover"
          sizes="100vw"
          quality={90}
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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Trouvez votre
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {' '}terrain idéal{' '}
            </span>
            au Sénégal
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            La plateforme de référence pour l'achat et la vente de terrains titrés et viabilisés au Sénégal.
          </p>

          {/* Points clés */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12"
          >
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <span className="text-lg font-medium">Terrains vérifiés</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <span className="text-lg font-medium">Titres fonciers sécurisés</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <span className="text-lg font-medium">Transactions transparentes</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/terrains">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-[0_10px_40px_rgba(16,185,129,0.3),0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.4),0_0_30px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                Découvrir les terrains
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 flex items-center gap-2"
              >
                Vendre mon terrain
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}