import { NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function GET() {
  try {
    // Check if API key exists
    if (!RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: 'RESEND_API_KEY non configure',
          details: 'Verifiez votre fichier .env.local',
          suggestions: [
            'Ajoutez RESEND_API_KEY dans .env.local',
            'Obtenez une cle sur resend.com'
          ]
        },
        { status: 500 }
      )
    }

    // Test API key validity by checking domains
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Resend API fonctionne correctement',
        apiKeyConfigured: true,
        domains: data.data || [],
        note: 'Vous pouvez maintenant envoyer des emails',
        warning: data.data?.length === 0 ? 'Aucun domaine configure - utilisez le domaine par defaut pour les tests' : null
      })
    } else if (response.status === 401) {
      return NextResponse.json(
        {
          error: 'API Key invalide',
          details: data.message || 'La cle API Resend est incorrecte',
          suggestions: [
            'Verifiez que la cle API est correcte',
            'Regenerez une nouvelle cle sur resend.com',
            'Verifiez qu\'il n\'y a pas d\'espaces dans la cle'
          ]
        },
        { status: 401 }
      )
    } else {
      return NextResponse.json(
        {
          error: 'Erreur Resend API',
          details: data.message || 'Erreur inconnue',
          statusCode: response.status
        },
        { status: response.status }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors du test Resend',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
