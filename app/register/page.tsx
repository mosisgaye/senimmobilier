'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Home, Loader2, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    accountType: 'simple' as 'simple' | 'professional',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      setLoading(false)
      return
    }

    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            account_type: formData.accountType
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Cette adresse email est déjà utilisée')
        } else {
          setError('Erreur lors de la création du compte')
        }
        return
      }

      if (authData.user) {
        // 2. Créer le profil utilisateur dans la table users
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            account_type: formData.accountType,
            properties_quota: formData.accountType === 'simple' ? 5 : 100
          })

        if (profileError) {
          console.error('Profile error:', profileError)
        }

        setSuccess(true)
        
        // Stocker un message de bienvenue
        localStorage.setItem('welcomeMessage', `Bienvenue ${formData.fullName}! Votre compte a été créé avec succès.`)
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé avec succès!</h2>
          <p className="text-gray-600 mb-6">
            Votre compte a été créé. Vous allez être redirigé vers la page de connexion...
          </p>
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-primary-600" />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1920&h=1080&fit=crop"
          alt="Real Estate"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center p-12">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-6">
              Rejoignez la communauté SenImmobilier
            </h1>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Publiez gratuitement</div>
                  <div className="text-white/80 text-sm">Jusqu'à 5 annonces pour les comptes gratuits</div>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Gestion simplifiée</div>
                  <div className="text-white/80 text-sm">Tableau de bord intuitif pour gérer vos biens</div>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Support dédié</div>
                  <div className="text-white/80 text-sm">Une équipe à votre écoute 7j/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <Home className="h-10 w-10 text-primary-600 mr-3" />
              <span className="text-3xl font-bold text-gray-900">SenImmobilier</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
              <p className="text-gray-600 mt-2">
                Commencez à publier vos annonces
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Account Type */}
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.accountType === 'simple' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="accountType"
                    value="simple"
                    checked={formData.accountType === 'simple'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium text-sm">Particulier</div>
                    <div className="text-xs text-gray-500">Gratuit - 5 annonces</div>
                  </div>
                </label>
                <label className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.accountType === 'professional' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="accountType"
                    value="professional"
                    checked={formData.accountType === 'professional'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium text-sm">Professionnel</div>
                    <div className="text-xs text-gray-500">25K FCFA/mois</div>
                  </div>
                </label>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                />
                <label className="ml-2 text-sm text-gray-600">
                  J'accepte les{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Création du compte...
                  </span>
                ) : (
                  'Créer mon compte'
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Déjà inscrit?{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Se connecter
                </Link>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}