'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, User, MessageSquare, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient, getErrorMessage, type LeadSubmission } from '@/lib/api/client'

interface ContactFormProps {
  propertyId: string
  propertyTitle: string
  onSuccess?: () => void
  defaultMessage?: string
}

export default function ContactForm({ propertyId, propertyTitle, onSuccess, defaultMessage }: ContactFormProps) {
  const [formData, setFormData] = useState<Omit<LeadSubmission, 'property_id'>>({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage || '',
    visit_date: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number
    resetTime: Date
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('') // Clear error on input change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const leadData: LeadSubmission = {
        property_id: propertyId,
        ...formData,
      }

      const { data, rateLimitInfo: rateInfo } = await apiClient.submitLead(leadData)

      // Update rate limit info
      if (rateInfo) {
        setRateLimitInfo({
          remaining: rateInfo.remaining,
          resetTime: new Date(rateInfo.reset),
        })
      }

      setSuccess(true)

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        visit_date: '',
      })

      // Call success callback
      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)

    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Check if user has reached rate limit
  const isRateLimited = rateLimitInfo && rateLimitInfo.remaining === 0

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Contactez le vendeur
        </h3>
        <p className="text-gray-600">
          Remplissez le formulaire ci-dessous pour obtenir plus d'informations sur ce terrain
        </p>
      </div>

      {/* Rate Limit Warning */}
      {isRateLimited && rateLimitInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800">
            <strong>Limite atteinte</strong>
            <p>
              Vous avez atteint la limite de soumissions. Veuillez r�essayer apr�s{' '}
              {rateLimitInfo.resetTime.toLocaleTimeString('fr-FR')}.
            </p>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <strong>Message envoy� avec succ�s!</strong>
              <p>Le vendeur vous contactera bient�t par email ou t�l�phone.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>Erreur</strong>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              disabled={loading || isRateLimited}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Votre nom et pr�nom"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || isRateLimited}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            T�l�phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              minLength={9}
              disabled={loading || isRateLimited}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="+221 77 123 45 67"
            />
          </div>
        </div>

        {/* Visit Date (Optional) */}
        <div>
          <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700 mb-2">
            Date de visite souhait�e (optionnel)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="visit_date"
              name="visit_date"
              type="datetime-local"
              value={formData.visit_date}
              onChange={handleChange}
              disabled={loading || isRateLimited}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              minLength={10}
              rows={4}
              disabled={loading || isRateLimited}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Bonjour, je suis int�ress� par ce terrain. Pourriez-vous me fournir plus d'informations?"
            />
          </div>
        </div>

        {/* Rate Limit Info (when not at limit) */}
        {rateLimitInfo && rateLimitInfo.remaining > 0 && rateLimitInfo.remaining <= 2 && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>
              {rateLimitInfo.remaining} soumission{rateLimitInfo.remaining > 1 ? 's' : ''} restante{rateLimitInfo.remaining > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: loading || isRateLimited ? 1 : 1.01 }}
          whileTap={{ scale: loading || isRateLimited ? 1 : 0.99 }}
          type="submit"
          disabled={loading || isRateLimited}
          className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Envoi en cours...
            </span>
          ) : (
            'Envoyer le message'
          )}
        </motion.button>

        <p className="text-xs text-gray-500 text-center">
          Vos informations sont s�curis�es et ne seront partag�es qu'avec le vendeur de ce terrain.
        </p>
      </form>
    </div>
  )
}
