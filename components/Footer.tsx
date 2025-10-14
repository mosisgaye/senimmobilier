import Link from 'next/link'
import { Home, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About Section */}
          <div>
            <div className="flex items-center mb-4">
              <Home className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-white">SenImmobilier</span>
            </div>
            <p className="text-sm mb-4">
              La plateforme de référence pour trouver votre terrain idéal au Sénégal.
              Terrains titrés, viabilisés et vérifiés.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary-600 rounded-full transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary-600 rounded-full transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary-600 rounded-full transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary-600 rounded-full transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terrains" className="hover:text-primary-500 transition-colors">
                  Terrains à Vendre
                </Link>
              </li>
              <li>
                <Link href="/partenaires" className="hover:text-primary-500 transition-colors">
                  Devenir Partenaire
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:text-primary-500 transition-colors">
                  Espace Pro
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary-500 transition-colors">
                  Publier une Annonce
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terrains?category=urbain" className="hover:text-primary-500 transition-colors">
                  Terrains Urbains
                </Link>
              </li>
              <li>
                <Link href="/terrains?category=residentiel" className="hover:text-primary-500 transition-colors">
                  Terrains Résidentiels
                </Link>
              </li>
              <li>
                <Link href="/terrains?category=agricole" className="hover:text-primary-500 transition-colors">
                  Terrains Agricoles
                </Link>
              </li>
              <li>
                <Link href="/terrains?category=commercial" className="hover:text-primary-500 transition-colors">
                  Terrains Commerciaux
                </Link>
              </li>
              <li>
                <Link href="/terrains?category=rural" className="hover:text-primary-500 transition-colors">
                  Terrains Ruraux
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <a href="tel:+221771234567" className="hover:text-primary-500 transition-colors">
                  +221 77 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <a href="mailto:contact@senimmobilier.sn" className="hover:text-primary-500 transition-colors">
                  contact@senimmobilier.sn
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Newsletter</h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2025 SenImmobilier. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="/conditions" className="hover:text-primary-500 transition-colors">
                Conditions d'utilisation
              </Link>
              <Link href="/confidentialite" className="hover:text-primary-500 transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/mentions-legales" className="hover:text-primary-500 transition-colors">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
