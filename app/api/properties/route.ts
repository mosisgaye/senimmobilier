import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/properties
 * Récupère la liste des propriétés avec filtres et pagination
 *
 * Query params:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre de résultats par page (défaut: 12)
 * - city: filtrer par ville
 * - property_type: filtrer par type (land, house, apartment)
 * - transaction_type: filtrer par transaction (sale, rent)
 * - min_price: prix minimum
 * - max_price: prix maximum
 * - min_surface: surface minimum
 * - max_surface: surface maximum
 * - is_titled: terrains titrés uniquement (true/false)
 * - is_serviced: terrains viabilisés uniquement (true/false)
 * - sort: tri (price_asc, price_desc, date_desc, date_asc, surface_asc, surface_desc)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Filtres
    const city = searchParams.get('city')
    const propertyType = searchParams.get('property_type')
    const transactionType = searchParams.get('transaction_type')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const minSurface = searchParams.get('min_surface')
    const maxSurface = searchParams.get('max_surface')
    const isTitled = searchParams.get('is_titled')
    const isServiced = searchParams.get('is_serviced')
    const sort = searchParams.get('sort') || 'date_desc'

    // Construction de la requête
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .eq('is_available', true)

    // Appliquer les filtres
    if (city) query = query.eq('city', city)
    if (propertyType) query = query.eq('property_type', propertyType)
    if (transactionType) query = query.eq('transaction_type', transactionType)
    if (minPrice) query = query.gte('price', parseInt(minPrice))
    if (maxPrice) query = query.lte('price', parseInt(maxPrice))
    if (minSurface) query = query.gte('surface_area', parseInt(minSurface))
    if (maxSurface) query = query.lte('surface_area', parseInt(maxSurface))
    if (isTitled === 'true') query = query.eq('is_titled', true)
    if (isServiced === 'true') query = query.eq('is_serviced', true)

    // Appliquer le tri
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'date_asc':
        query = query.order('created_at', { ascending: true })
        break
      case 'surface_asc':
        query = query.order('surface_area', { ascending: true })
        break
      case 'surface_desc':
        query = query.order('surface_area', { ascending: false })
        break
      case 'date_desc':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Appliquer la pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des propriétés' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      properties: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur inattendue' },
      { status: 500 }
    )
  }
}
