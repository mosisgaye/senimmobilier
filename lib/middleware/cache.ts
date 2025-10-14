import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export interface CacheConfig {
  ttl: number // Time to live in seconds
  keyPrefix?: string // Optional prefix for Redis keys
}

/**
 * Cache TTL configurations for different data types
 */
export const CACHE_TTL = {
  // Google Maps API responses
  geocode: 30 * 24 * 60 * 60, // 30 days (addresses rarely change)
  places: 24 * 60 * 60, // 24 hours (places info can change)
  distance: 12 * 60 * 60, // 12 hours (traffic patterns)
  streetView: 7 * 24 * 60 * 60, // 7 days (street view rarely changes)

  // Database queries
  listings: 5 * 60, // 5 minutes (frequent updates)
  listingDetail: 10 * 60, // 10 minutes
  users: 30 * 60, // 30 minutes
  stats: 60 * 60, // 1 hour

  // Search results
  search: 5 * 60, // 5 minutes
  filters: 15 * 60, // 15 minutes
}

/**
 * Get cached data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) {
    return null
  }

  try {
    const cached = await redis.get<T>(key)
    return cached || null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

/**
 * Set cache data
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number
): Promise<boolean> {
  if (!redis) {
    return false
  }

  try {
    await redis.set(key, data, { ex: ttl })
    return true
  } catch (error) {
    console.error('Cache set error:', error)
    return false
  }
}

/**
 * Delete cache data
 */
export async function deleteCache(key: string): Promise<boolean> {
  if (!redis) {
    return false
  }

  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Cache delete error:', error)
    return false
  }
}

/**
 * Delete multiple cache keys by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  if (!redis) {
    return 0
  }

  try {
    // Get all keys matching the pattern
    const keys = await redis.keys(pattern)
    if (keys.length === 0) {
      return 0
    }

    // Delete all matching keys
    await redis.del(...keys)
    return keys.length
  } catch (error) {
    console.error('Cache pattern delete error:', error)
    return 0
  }
}

/**
 * Higher-order function to wrap functions with caching
 */
export function withCache<T>(
  cacheKey: string,
  ttl: number,
  fn: () => Promise<T>
): () => Promise<T> {
  return async (): Promise<T> => {
    // Try to get from cache
    const cached = await getCache<T>(cacheKey)
    if (cached !== null) {
      console.log(`Cache hit: ${cacheKey}`)
      return cached
    }

    // Execute function
    console.log(`Cache miss: ${cacheKey}`)
    const result = await fn()

    // Store in cache
    await setCache(cacheKey, result, ttl)

    return result
  }
}

/**
 * Generate cache key for Google Maps Geocode API
 */
export function getCacheKeyGeocode(address: string): string {
  const normalized = address.toLowerCase().trim().replace(/\s+/g, '_')
  return `maps:geocode:${normalized}`
}

/**
 * Generate cache key for Google Maps Places API
 */
export function getCacheKeyPlaces(lat: number, lng: number, radius: number): string {
  return `maps:places:${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`
}

/**
 * Generate cache key for Google Maps Distance API
 */
export function getCacheKeyDistance(
  origin: string,
  destination: string,
  mode: string = 'driving'
): string {
  const originNorm = origin.toLowerCase().trim().replace(/\s+/g, '_')
  const destNorm = destination.toLowerCase().trim().replace(/\s+/g, '_')
  return `maps:distance:${originNorm}_to_${destNorm}_${mode}`
}

/**
 * Generate cache key for Google Maps Street View API
 */
export function getCacheKeyStreetView(lat: number, lng: number): string {
  return `maps:streetview:${lat.toFixed(6)}_${lng.toFixed(6)}`
}

/**
 * Generate cache key for listing
 */
export function getCacheKeyListing(slug: string): string {
  return `listing:${slug}`
}

/**
 * Generate cache key for listings query
 */
export function getCacheKeyListings(params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return `listings:${sortedParams}`
}

/**
 * Invalidate all listing-related caches
 */
export async function invalidateListingCaches(slug?: string): Promise<void> {
  if (slug) {
    // Invalidate specific listing
    await deleteCache(getCacheKeyListing(slug))
  }

  // Invalidate all listings queries
  await deleteCachePattern('listings:*')
}

/**
 * Cache statistics
 */
export interface CacheStats {
  keys: number
  memoryUsage: number
}

export async function getCacheStats(): Promise<CacheStats | null> {
  if (!redis) {
    return null
  }

  try {
    const keys = await redis.keys('*')
    return {
      keys: keys.length,
      memoryUsage: 0, // Upstash doesn't provide memory info via REST API
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return null
  }
}
