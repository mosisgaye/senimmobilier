'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

type TestStatus = 'idle' | 'loading' | 'success' | 'error'

interface TestResult {
  status: TestStatus
  message?: string
  details?: any
}

export default function TestAPIPage() {
  const [googleMaps, setGoogleMaps] = useState<TestResult>({ status: 'idle' })
  const [supabase, setSupabase] = useState<TestResult>({ status: 'idle' })
  const [redis, setRedis] = useState<TestResult>({ status: 'idle' })
  const [resend, setResend] = useState<TestResult>({ status: 'idle' })

  const testGoogleMaps = async () => {
    setGoogleMaps({ status: 'loading' })
    try {
      const response = await fetch('/api/test/google-maps')
      const data = await response.json()

      if (response.ok) {
        setGoogleMaps({
          status: 'success',
          message: 'Google Maps API fonctionne',
          details: data
        })
      } else {
        setGoogleMaps({
          status: 'error',
          message: data.error || 'Erreur API',
          details: data
        })
      }
    } catch (error) {
      setGoogleMaps({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur reseau'
      })
    }
  }

  const testSupabase = async () => {
    setSupabase({ status: 'loading' })
    try {
      const response = await fetch('/api/test/supabase')
      const data = await response.json()

      if (response.ok) {
        setSupabase({
          status: 'success',
          message: 'Supabase connecte',
          details: data
        })
      } else {
        setSupabase({
          status: 'error',
          message: data.error || 'Erreur connexion',
          details: data
        })
      }
    } catch (error) {
      setSupabase({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur reseau'
      })
    }
  }

  const testRedis = async () => {
    setRedis({ status: 'loading' })
    try {
      const response = await fetch('/api/test/redis')
      const data = await response.json()

      if (response.ok) {
        setRedis({
          status: 'success',
          message: 'Upstash Redis connecte',
          details: data
        })
      } else {
        setRedis({
          status: 'error',
          message: data.error || 'Erreur connexion',
          details: data
        })
      }
    } catch (error) {
      setRedis({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur reseau'
      })
    }
  }

  const testResend = async () => {
    setResend({ status: 'loading' })
    try {
      const response = await fetch('/api/test/resend')
      const data = await response.json()

      if (response.ok) {
        setResend({
          status: 'success',
          message: 'Resend API fonctionne',
          details: data
        })
      } else {
        setResend({
          status: 'error',
          message: data.error || 'Erreur API',
          details: data
        })
      }
    } catch (error) {
      setResend({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur reseau'
      })
    }
  }

  const testAll = () => {
    testGoogleMaps()
    testSupabase()
    testRedis()
    testResend()
  }

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test des APIs et Services
          </h1>
          <p className="text-gray-600 mb-8">
            Verifiez que toutes les configurations sont correctes
          </p>

          <button
            onClick={testAll}
            className="w-full mb-8 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
          >
            Tester Tous les Services
          </button>

          <div className="space-y-6">
            {/* Google Maps Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(googleMaps.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Google Maps API</h3>
                    <p className="text-sm text-gray-600">
                      Geocoding, Places, Distance Matrix
                    </p>
                  </div>
                </div>
                <button
                  onClick={testGoogleMaps}
                  disabled={googleMaps.status === 'loading'}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  Tester
                </button>
              </div>
              {googleMaps.message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  googleMaps.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">{googleMaps.message}</p>
                  {googleMaps.details && (
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(googleMaps.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Supabase Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(supabase.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Supabase</h3>
                    <p className="text-sm text-gray-600">
                      Database, Auth, Storage
                    </p>
                  </div>
                </div>
                <button
                  onClick={testSupabase}
                  disabled={supabase.status === 'loading'}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  Tester
                </button>
              </div>
              {supabase.message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  supabase.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">{supabase.message}</p>
                  {supabase.details && (
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(supabase.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Redis Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(redis.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Upstash Redis</h3>
                    <p className="text-sm text-gray-600">
                      Rate Limiting, Caching
                    </p>
                  </div>
                </div>
                <button
                  onClick={testRedis}
                  disabled={redis.status === 'loading'}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  Tester
                </button>
              </div>
              {redis.message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  redis.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">{redis.message}</p>
                  {redis.details && (
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(redis.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Resend Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(resend.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Resend Email</h3>
                    <p className="text-sm text-gray-600">
                      Email Notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={testResend}
                  disabled={resend.status === 'loading'}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  Tester
                </button>
              </div>
              {resend.message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  resend.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">{resend.message}</p>
                  {resend.details && (
                    <pre className="mt-2 text-xs overflow-x-auto">
                      {JSON.stringify(resend.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
