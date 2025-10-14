/**
 * API Client for BFF Endpoints
 * Centralized API calls with error handling, rate limiting, and type safety
 */

// Types
export interface Property {
  id: string
  title: string
  slug: string
  description: string
  price: number
  surface: number
  city: string
  address: string
  category: string
  status: string
  images: string[]
  features: string[]
  coordinates?: {
    lat: number
    lng: number
  }
  user_id: string
  created_at: string
  updated_at: string
  views_count?: number
}

export interface Seller {
  id: string
  full_name: string
  account_type: string
  phone: string
}

export interface GoogleMapsEnrichment {
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

export interface ListingsResponse {
  data: Property[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ListingDetailResponse {
  listing: Property
  seller: Seller
  maps: GoogleMapsEnrichment
}

export interface LeadSubmission {
  property_id: string
  name: string
  email: string
  phone: string
  message: string
  visit_date?: string
}

export interface LeadResponse {
  success: boolean
  lead: any
  emailSent: boolean
  message: string
}

export interface UploadSignRequest {
  fileName: string
  fileType: string
  fileSize: number
  bucket: 'listing-images' | 'listing-docs' | 'avatars'
}

export interface UploadSignResponse {
  signedUrl: string
  token: string
  path: string
  bucket: string
  expiresIn: number
}

export interface APIError {
  error: string
  message?: string
  details?: any
  limit?: number
  remaining?: number
  reset?: string
}

// Rate limit info from response headers
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
}

/**
 * Custom API Error class
 */
export class APIClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: APIError,
    public rateLimitInfo?: RateLimitInfo
  ) {
    super(message)
    this.name = 'APIClientError'
  }
}

/**
 * Extract rate limit info from response headers
 */
function extractRateLimitInfo(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get('X-RateLimit-Limit')
  const remaining = headers.get('X-RateLimit-Remaining')
  const reset = headers.get('X-RateLimit-Reset')

  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      reset: parseInt(reset),
    }
  }

  return undefined
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; rateLimitInfo?: RateLimitInfo }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const rateLimitInfo = extractRateLimitInfo(response.headers)

    if (!response.ok) {
      const errorData: APIError = await response.json().catch(() => ({
        error: 'Unknown error',
      }))

      throw new APIClientError(
        errorData.message || errorData.error || 'API request failed',
        response.status,
        errorData,
        rateLimitInfo
      )
    }

    const data: T = await response.json()
    return { data, rateLimitInfo }
  } catch (error) {
    if (error instanceof APIClientError) {
      throw error
    }

    // Network or other errors
    throw new APIClientError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

/**
 * API Client
 */
export const apiClient = {
  /**
   * Get listings with filters and pagination
   */
  async getListings(params?: {
    page?: number
    limit?: number
    city?: string
    category?: string
    status?: string
    priceMin?: number
    priceMax?: number
    surfaceMin?: number
    surfaceMax?: number
    searchTerm?: string
    sortBy?: 'price_asc' | 'price_desc' | 'surface_asc' | 'surface_desc' | 'recent'
  }): Promise<ListingsResponse> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const { data } = await apiFetch<ListingsResponse>(
      `/api/listings?${searchParams.toString()}`
    )

    return data
  },

  /**
   * Get listing detail by slug
   */
  async getListingDetail(slug: string): Promise<ListingDetailResponse> {
    const { data } = await apiFetch<ListingDetailResponse>(
      `/api/listings/${slug}`
    )

    return data
  },

  /**
   * Submit lead (contact form)
   */
  async submitLead(
    leadData: LeadSubmission
  ): Promise<{ data: LeadResponse; rateLimitInfo?: RateLimitInfo }> {
    return apiFetch<LeadResponse>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    })
  },

  /**
   * Request signed URL for file upload
   */
  async requestUploadUrl(
    request: UploadSignRequest,
    token: string
  ): Promise<UploadSignResponse> {
    const { data } = await apiFetch<UploadSignResponse>('/api/uploads/sign', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    })

    return data
  },

  /**
   * Upload file to signed URL
   */
  async uploadFile(signedUrl: string, file: File): Promise<void> {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to upload file')
    }
  },

  /**
   * Complete upload flow: request URL + upload file
   */
  async uploadFileComplete(
    file: File,
    bucket: 'listing-images' | 'listing-docs' | 'avatars',
    token: string
  ): Promise<string> {
    // 1. Request signed URL
    const signResponse = await this.requestUploadUrl(
      {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket,
      },
      token
    )

    // 2. Upload file
    await this.uploadFile(signResponse.signedUrl, file)

    // 3. Return file path
    return signResponse.path
  },
}

/**
 * React hook for error handling with user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIClientError) {
    // Rate limit error
    if (error.status === 429) {
      const resetDate = error.data?.reset
        ? new Date(error.data.reset)
        : new Date(Date.now() + 60000)
      const minutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000)

      return `Trop de requetes. Veuillez reessayer dans ${minutes} minute${minutes > 1 ? 's' : ''}.`
    }

    // Validation error
    if (error.status === 400) {
      return error.data?.message || 'Donnees invalides. Veuillez verifier votre saisie.'
    }

    // Not found
    if (error.status === 404) {
      return 'Ressource non trouvee.'
    }

    // Unauthorized
    if (error.status === 401) {
      return 'Authentification requise. Veuillez vous connecter.'
    }

    // Server error
    if (error.status >= 500) {
      return 'Erreur serveur. Veuillez reessayer plus tard.'
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur est survenue. Veuillez reessayer.'
}
