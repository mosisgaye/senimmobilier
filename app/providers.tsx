'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { ComparisonProvider } from '@/lib/ComparisonContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <ComparisonProvider>
        {children}
      </ComparisonProvider>
    </GoogleOAuthProvider>
  )
}