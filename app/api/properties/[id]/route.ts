import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/properties/[id]
 * Récupère une propriété par son ID ou slug
 * Et incrémente le compteur de vues
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Essayer de récupérer par UUID ou par slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')

    if (isUUID) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', id)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Propriété non trouvée' },
          { status: 404 }
        )
      }
      console.error('Error fetching property:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la propriété' },
        { status: 500 }
      )
    }

    // Incrémenter le compteur de vues
    if (data) {
      await supabase.rpc('increment_property_views', {
        property_id: data.id
      })
    }

    return NextResponse.json({ property: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur inattendue' },
      { status: 500 }
    )
  }
}
