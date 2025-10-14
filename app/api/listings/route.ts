import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Zod validation schema for query parameters
const ListingsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('12').transform(Number),
  city: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  priceMin: z.string().optional().transform(val => val ? Number(val) : undefined),
  priceMax: z.string().optional().transform(val => val ? Number(val) : undefined),
  surfaceMin: z.string().optional().transform(val => val ? Number(val) : undefined),
  surfaceMax: z.string().optional().transform(val => val ? Number(val) : undefined),
  searchTerm: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'surface_asc', 'surface_desc', 'recent']).optional().default('recent'),
})

type ListingsQuery = z.infer<typeof ListingsQuerySchema>

// Initialize Supabase client (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const validationResult = ListingsQuerySchema.safeParse(searchParams)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const params = validationResult.data

    // Build Supabase query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'available')

    // Apply filters
    if (params.city) {
      query = query.eq('city', params.city)
    }

    if (params.category) {
      query = query.eq('category', params.category)
    }

    if (params.priceMin !== undefined) {
      query = query.gte('price', params.priceMin)
    }

    if (params.priceMax !== undefined) {
      query = query.lte('price', params.priceMax)
    }

    if (params.surfaceMin !== undefined) {
      query = query.gte('surface', params.surfaceMin)
    }

    if (params.surfaceMax !== undefined) {
      query = query.lte('surface', params.surfaceMax)
    }

    if (params.searchTerm) {
      query = query.or(`title.ilike.%${params.searchTerm}%,description.ilike.%${params.searchTerm}%`)
    }

    // Apply sorting
    switch (params.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'surface_asc':
        query = query.order('surface', { ascending: true })
        break
      case 'surface_desc':
        query = query.order('surface', { ascending: false })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    const offset = (params.page - 1) * params.limit
    query = query.range(offset, offset + params.limit - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      )
    }

    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / params.limit) : 0

    return NextResponse.json({
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPrevPage: params.page > 1,
      },
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
