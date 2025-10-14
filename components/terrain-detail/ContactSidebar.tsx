'use client'

import { Phone, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import ContactForm from '@/components/ContactForm'

interface ContactSidebarProps {
  terrain: {
    id: string
    title: string
    slug: string
    price_fcfa: number
  }
  seller: {
    name: string
    phone_e164?: string
    whatsapp_number?: string
    email?: string
    verified?: boolean
    type: 'agency' | 'owner'
  }
}

export default function ContactSidebar({ terrain, seller }: ContactSidebarProps) {
  // Lien WhatsApp
  const whatsappNumber = seller.whatsapp_number || seller.phone_e164
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Bonjour, je suis interesse par votre annonce SenImmobilier:\n\n${terrain.title}\nReference: ${terrain.id}\n\nhttps://senimmobilier.sn/terrains/${terrain.slug}`
      )}`
    : null

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      {/* En-tete */}
      <div className="text-center border-b pb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Contacter le vendeur
        </h3>
        <p className="text-sm text-gray-600">
          {seller.type === 'agency' ? '🏢 Agence' : '👤 Particulier'} • {seller.name}
        </p>
      </div>

      {/* Boutons d'action rapide */}
      <div className="space-y-3">
        {whatsappLink && (
          <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <MessageSquare className="h-5 w-5" />
            WhatsApp
          </motion.a>
        )}

        {seller.phone_e164 && (
          <motion.a
            href={`tel:${seller.phone_e164}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <Phone className="h-5 w-5" />
            Appeler
          </motion.a>
        )}
      </div>

      {/* Formulaire de contact integre avec BFF */}
      <div className="border-t pt-6">
        <ContactForm
          propertyId={terrain.id}
          propertyTitle={terrain.title}
          defaultMessage={`Bonjour,

Je suis interesse par votre terrain "${terrain.title}".

Pourriez-vous me fournir plus d'informations ?

Merci.`}
        />
      </div>
    </div>
  )
}
