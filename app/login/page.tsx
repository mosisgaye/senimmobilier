'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Home, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useGoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', {
        user: data?.user?.email,
        session: !!data?.session,
        error: error?.message
      })

      if (error) {
        setError('Email ou mot de passe incorrect')
        return
      }

      if (data.user && data.session) {
        console.log('Login successful, redirecting...')
        // Attendre que la session soit stockee
        await new Promise(resolve => setTimeout(resolve, 500))
        // Rediriger vers le dashboard Next.js
        window.location.href = '/dashboard'
        return // Ne pas executer le finally
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      try {
        // Récupérer les informations de l'utilisateur depuis Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const userInfo = await userInfoResponse.json()
        
        // Créer ou récupérer l'utilisateur dans Supabase
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', userInfo.email)
          .single()
        
        if (!existingUser) {
          // Créer un nouvel utilisateur
          await supabase
            .from('users')
            .insert({
              email: userInfo.email,
              first_name: userInfo.given_name || '',
              last_name: userInfo.family_name || '',
              account_type: 'particular',
              created_at: new Date().toISOString()
            })
        }
        
        // Rediriger vers le dashboard Next.js
        window.location.href = '/dashboard'
        return // Ne pas executer le finally
      } catch (err) {
        console.error('Erreur Google Login:', err)
        setError('Erreur lors de la connexion avec Google')
        setGoogleLoading(false)
      }
    },
    onError: () => {
      setError('Échec de la connexion avec Google')
    },
    flow: 'implicit'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <Home className="h-10 w-10 text-emerald-600 mr-3" />
              <span className="text-3xl font-bold text-gray-900">SenImmobilier</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Bon retour !</h2>
              <p className="text-gray-600 mt-2">
                Connectez-vous pour gérer vos annonces
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                  Mot de passe oublié?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              {/* Google Login Button */}
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={googleLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {googleLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Connexion...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuer avec Google
                    </>
                  )}
                </motion.button>
              </div>

              {/* Another Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Nouveau sur SenImmobilier?</span>
                  </div>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6">
                <Link
                  href="/register"
                  className="w-full flex justify-center py-3 px-4 border border-emerald-600 rounded-lg text-emerald-600 font-medium hover:bg-emerald-50 transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-emerald-800/90 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop"
          alt="Real Estate"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-6">
              Gérez vos propriétés en toute simplicité
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Publiez, modifiez et suivez vos annonces immobilières depuis votre tableau de bord personnel.
            </p>
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-white/80">Annonces actives</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">5K+</div>
                <div className="text-white/80">Utilisateurs satisfaits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}