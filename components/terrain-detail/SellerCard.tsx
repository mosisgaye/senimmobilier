import { BadgeCheck, Building2, User, Phone, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SellerCardProps {
  seller: {
    id: string
    type: 'agency' | 'owner'
    name: string
    verified?: boolean
    phone_e164?: string
    email?: string
    logo_url?: string
  }
}

export default function SellerCard({ seller }: SellerCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos du vendeur</h2>

      <div className="flex items-start gap-4">
        {/* Photo/Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {seller.logo_url ? (
            <Image
              src={seller.logo_url}
              alt={seller.name}
              fill
              className="object-cover"
              sizes="64px"
              loading="lazy"
              quality={80}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {seller.type === 'agency' ? (
                <Building2 className="h-8 w-8 text-gray-400" />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{seller.name}</h3>
            {seller.verified && (
              <BadgeCheck className="h-5 w-5 text-green-600" />
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            {seller.type === 'agency' ? (
              <>
                <Building2 className="h-4 w-4" />
                <span>Agence Immobilière</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Particulier</span>
              </>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-2 text-sm">
            {seller.phone_e164 && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{seller.phone_e164}</span>
              </div>
            )}
            {seller.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{seller.email}</span>
              </div>
            )}
          </div>

          {/* Voir toutes les annonces */}
          <Link
            href={`/vendeurs/${seller.id}`}
            className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm hover:underline"
          >
            Voir toutes ses annonces →
          </Link>
        </div>
      </div>

      {/* Badge vérifié */}
      {seller.verified && (
        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
          <div className="flex gap-3">
            <BadgeCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-medium mb-1">Vendeur vérifié</p>
              <p className="text-green-700">
                Ce vendeur a été vérifié par Fatimmo. Son identité et ses documents ont été contrôlés.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
