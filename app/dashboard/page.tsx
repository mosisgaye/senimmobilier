'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Home, Plus, BarChart3, Settings, LogOut, Loader2, User, Bell, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // Attendre un peu pour que la session soit chargee
      await new Promise(resolve => setTimeout(resolve, 300))

      const { data: { session }, error } = await supabase.auth.getSession()

      console.log('Session check:', { session: !!session, error, user: session?.user?.email })

      if (error) {
        console.error('Session error:', error)
        router.push('/login')
        return
      }

      if (!session) {
        console.log('No session found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('User authenticated:', session.user.email)
      setUser(session.user)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Dashboard */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">SenImmobilier</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-900 hover:text-emerald-600 font-medium">
                Tableau de bord
              </Link>
              <Link href="/dashboard/listings" className="text-gray-600 hover:text-gray-900">
                Mes annonces
              </Link>
              <Link href="/dashboard/messages" className="text-gray-600 hover:text-gray-900">
                Messages
              </Link>
              <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900">
                Parametres
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </button>
              </div>

              {/* Logout Button Desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Deconnexion</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-900" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4 space-y-3">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/dashboard/listings"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Mes annonces
                </Link>
                <Link
                  href="/dashboard/messages"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Messages
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Parametres
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Deconnexion</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur votre tableau de bord
          </h1>
          <p className="text-gray-600">
            Connecte en tant que <span className="font-medium text-gray-900">{user?.email}</span>
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Annonces actives</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Ce mois</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Vues totales</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">Non lus</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Messages recus</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Favoris</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/create-listing')}
              className="flex items-center gap-4 p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Plus className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Nouvelle annonce</h3>
                <p className="text-sm text-gray-600">Publier un terrain</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/listings')}
              className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Home className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Mes annonces</h3>
                <p className="text-sm text-gray-600">Gerer vos listings</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/settings')}
              className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Parametres</h3>
                <p className="text-sm text-gray-600">Configurer votre compte</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-8 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activite recente</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Aucune activite pour le moment</p>
            <button
              onClick={() => router.push('/create-listing')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              Publier votre premiere annonce
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
