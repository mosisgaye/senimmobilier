'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, ChevronDown, MapPin, Tag, DollarSign, Handshake, Briefcase, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    {
      label: 'Terrains à Vendre',
      href: '/terrains',
      hasDropdown: true,
      icon: Home,
      subItems: [
        { href: '/terrains?category=urbain', label: 'Terrains Urbains', icon: MapPin },
        { href: '/terrains?category=residentiel', label: 'Terrains Résidentiels', icon: Home },
        { href: '/terrains?category=agricole', label: 'Terrains Agricoles', icon: Tag },
        { href: '/terrains?sort=price_asc', label: 'Par Budget', icon: DollarSign }
      ]
    },
    { href: '/partenaires', label: 'Devenir Partenaire', icon: Handshake },
    { href: '/pro', label: 'Espace Pro', icon: Briefcase },
    { href: '/contact', label: 'Contact', icon: Phone }
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-12">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/images/senimmobilier.svg"
                alt="SenImmobilier"
                width={180}
                height={60}
                className="h-14 w-auto"
                priority
                quality={100}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "font-medium transition-colors hover:text-emerald-600 flex items-center gap-1",
                    isScrolled ? "text-gray-700" : "text-white"
                  )}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      openDropdown === item.label && "rotate-180"
                    )} />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.hasDropdown && item.subItems && (
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden"
                      >
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-gray-700 hover:text-emerald-600"
                            >
                              <SubIcon className="h-5 w-5" />
                              <span className="font-medium">{subItem.label}</span>
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all",
                  isScrolled
                    ? "text-gray-700 hover:text-emerald-600"
                    : "text-white hover:text-white/80"
                )}
              >
                Se connecter
              </motion.button>
            </Link>

            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all shadow-lg",
                  isScrolled
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                    : "bg-white text-emerald-600 hover:bg-gray-100"
                )}
              >
                Publier une annonce
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "md:hidden p-2 rounded-md transition-colors",
              isScrolled 
                ? "text-gray-700 hover:bg-gray-100" 
                : "text-white hover:bg-white/10"
            )}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => {
                const ItemIcon = item.icon
                return (
                  <div key={item.label} className="space-y-2">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-gray-700 font-medium hover:text-emerald-600 transition-colors"
                    >
                      <ItemIcon className="h-5 w-5" />
                      {item.label}
                      {item.hasDropdown && <ChevronDown className="h-4 w-4 ml-auto" />}
                    </Link>

                    {/* Submenu pour mobile */}
                    {item.hasDropdown && item.subItems && (
                      <div className="pl-7 space-y-2">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-2 py-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                            >
                              <SubIcon className="h-4 w-4" />
                              {subItem.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="pt-4 border-t space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 border border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                >
                  Publier une annonce
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}