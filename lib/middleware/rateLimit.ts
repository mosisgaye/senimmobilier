import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests per window
  keyPrefix?: string // Optional prefix for Redis keys
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Timestamp when the limit resets
}

/**
 * Rate limiting using Upstash Redis and sliding window algorithm
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // If Redis is not configured, allow all requests (development mode)
  if (!redis) {
    console.warn('Redis not configured - rate limiting disabled')
    return {
      success: true,
      limit: config.max,
      remaining: config.max,
      reset: Date.now() + config.windowMs,
    }
  }

  // Get client identifier (IP address or user ID)
  const identifier = getIdentifier(request)
  const key = `${config.keyPrefix || 'ratelimit'}:${identifier}`

  try {
    // Get current timestamp
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline()

    // Remove old entries outside the time window
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    pipeline.zcard(key)

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })

    // Set expiration on the key
    pipeline.expire(key, Math.ceil(config.windowMs / 1000))

    const results = await pipeline.exec()

    // Extract count from results (index 1 is the zcard result)
    const count = (results[1] as number) || 0

    const remaining = Math.max(0, config.max - count - 1)
    const success = count < config.max

    return {
      success,
      limit: config.max,
      remaining,
      reset: now + config.windowMs,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: config.max,
      remaining: config.max,
      reset: Date.now() + config.windowMs,
    }
  }
}

/**
 * Get client identifier from request
 * Priority: User ID > IP Address > Fallback
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    // You could decode the JWT here to get user ID
    // For now, use the token itself as identifier
    return `user:${token.slice(0, 20)}`
  }

  // Try to get IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`
  }

  if (realIp) {
    return `ip:${realIp}`
  }

  // Fallback to anonymous
  return 'ip:anonymous'
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const result = await rateLimit(request, config)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          limit: result.limit,
          remaining: result.remaining,
          reset: new Date(result.reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = await handler(request, context)

    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toString())

    return response
  }
}

/**
 * Predefined rate limit configs for common use cases
 */
export const RATE_LIMITS = {
  // Public API endpoints
  public: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    keyPrefix: 'public',
  },
  // Authenticated API endpoints
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests per minute
    keyPrefix: 'auth',
  },
  // Expensive operations (Google Maps, etc.)
  expensive: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    keyPrefix: 'expensive',
  },
  // Form submissions (leads, contact, etc.)
  forms: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 submissions per minute
    keyPrefix: 'form',
  },
  // Upload operations
  uploads: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
    keyPrefix: 'upload',
  },
}
