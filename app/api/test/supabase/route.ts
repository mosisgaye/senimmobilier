import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  try {
    // Check if credentials exist
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error: 'Supabase credentials manquantes',
          details: {
            url: !!SUPABASE_URL,
            serviceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY
          },
          suggestions: [
            'Verifiez NEXT_PUBLIC_SUPABASE_URL dans .env.local',
            'Verifiez SUPABASE_SERVICE_ROLE_KEY dans .env.local'
          ]
        },
        { status: 500 }
      )
    }

    // Create Supabase client with auth options to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test 1: Check connection with a simple query
    const { data: healthCheck, error: healthError } = await supabase
      .from('listings')
      .select('id')
      .limit(1)

    if (healthError) {
      return NextResponse.json(
        {
          error: 'Erreur connexion Supabase',
          details: healthError.message,
          code: healthError.code,
          suggestions: [
            'Verifiez que la table "listings" existe',
            'Verifiez les permissions RLS',
            'Verifiez que le projet Supabase est actif'
          ]
        },
        { status: 500 }
      )
    }

    // Test 2: Count listings
    const { count, error: countError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })

    // Test 3: Check storage buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    return NextResponse.json({
      success: true,
      message: 'Supabase connecte avec succes',
      connection: {
        url: SUPABASE_URL,
        authenticated: true
      },
      database: {
        connected: true,
        listingsCount: count || 0
      },
      storage: {
        available: !bucketsError,
        buckets: buckets?.map(b => b.name) || []
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors du test Supabase',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
