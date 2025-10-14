import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Google Maps API key (server-side only)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

interface GoogleMapsEnrichment {
  geocode?: {
    lat: number
    lng: number
    formattedAddress: string
  }
  nearbyPlaces?: Array<{
    name: string
    type: string
    distance: number
  }>
  streetViewAvailable?: boolean
}

async function enrichWithGoogleMaps(
  address: string,
  coordinates?: { lat: number; lng: number }
): Promise<GoogleMapsEnrichment> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured')
    return {}
  }

  const enrichment: GoogleMapsEnrichment = {}

  try {
    // 1. Geocoding (if coordinates not available)
    if (!coordinates) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      const geocodeResponse = await fetch(geocodeUrl)
      const geocodeData = await geocodeResponse.json()

      if (geocodeData.status === 'OK' && geocodeData.results[0]) {
        const result = geocodeData.results[0]
        enrichment.geocode = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
        }
        coordinates = enrichment.geocode
      }
    }

    // 2. Check Street View availability
    if (coordinates) {
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${coordinates.lat},${coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`
      const streetViewResponse = await fetch(streetViewUrl)
      const streetViewData = await streetViewResponse.json()
      enrichment.streetViewAvailable = streetViewData.status === 'OK'

      // 3. Nearby Places (points of interest)
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=2000&key=${GOOGLE_MAPS_API_KEY}`
      const placesResponse = await fetch(placesUrl)
      const placesData = await placesResponse.json()

      if (placesData.status === 'OK' && placesData.results) {
        // Get top 5 places (schools, hospitals, markets, etc.)
        enrichment.nearbyPlaces = placesData.results
          .slice(0, 5)
          .map((place: any) => ({
            name: place.name,
            type: place.types[0] || 'place',
            distance: Math.round(
              calculateDistance(
                coordinates!.lat,
                coordinates!.lng,
                place.geometry.location.lat,
                place.geometry.location.lng
              )
            ),
          }))
      }
    }
  } catch (error) {
    console.error('Google Maps enrichment error:', error)
    // Return partial data if available
  }

  return enrichment
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    // Fetch listing from Supabase
    const { data: listing, error } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Enrich with Google Maps data
    const mapsEnrichment = await enrichWithGoogleMaps(
      listing.address || `${listing.city}, Sénégal`,
      listing.coordinates
    )

    // Fetch seller information (with RLS in place, only public info)
    const { data: seller } = await supabase
      .from('users')
      .select('id, full_name, account_type, phone')
      .eq('id', listing.user_id)
      .single()

    // Increment view count
    await supabase
      .from('properties')
      .update({ views_count: (listing.views_count || 0) + 1 })
      .eq('id', listing.id)

    // Return enriched listing
    return NextResponse.json({
      listing: {
        ...listing,
        views_count: (listing.views_count || 0) + 1,
      },
      seller,
      maps: mapsEnrichment,
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
