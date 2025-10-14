import { NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

export async function GET() {
  try {
    // Check if API key exists
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        {
          error: 'GOOGLE_MAPS_API_KEY non configure',
          details: 'Verifiez votre fichier .env.local'
        },
        { status: 500 }
      )
    }

    // Test with a simple geocoding request
    const testAddress = 'Dakar, Senegal'
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${GOOGLE_MAPS_API_KEY}`

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (data.status === 'OK') {
      return NextResponse.json({
        success: true,
        message: 'Google Maps API fonctionne correctement',
        testAddress,
        result: {
          formattedAddress: data.results[0]?.formatted_address,
          location: data.results[0]?.geometry?.location,
          placeId: data.results[0]?.place_id
        },
        apiKeyConfigured: true,
        status: data.status
      })
    } else if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json(
        {
          error: 'API Key invalide ou restrictions non configurees',
          details: data.error_message,
          status: data.status,
          suggestions: [
            'Verifiez que la cle API est correcte',
            'Activez Geocoding API dans Google Cloud Console',
            'Verifiez les restrictions HTTP referrer',
            'Verifiez que la facturation est activee'
          ]
        },
        { status: 403 }
      )
    } else {
      return NextResponse.json(
        {
          error: `Google Maps API erreur: ${data.status}`,
          details: data.error_message || 'Erreur inconnue',
          status: data.status
        },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors du test Google Maps',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
