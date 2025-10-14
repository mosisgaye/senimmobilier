import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export async function GET() {
  try {
    // Check if credentials exist
    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json(
        {
          error: 'Upstash Redis credentials manquantes',
          details: {
            url: !!UPSTASH_REDIS_REST_URL,
            token: !!UPSTASH_REDIS_REST_TOKEN
          },
          suggestions: [
            'Verifiez UPSTASH_REDIS_REST_URL dans .env.local',
            'Verifiez UPSTASH_REDIS_REST_TOKEN dans .env.local',
            'Pas de guillemets autour des valeurs'
          ]
        },
        { status: 500 }
      )
    }

    // Create Redis client
    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    })

    // Test 1: Set a test key
    const testKey = `test:${Date.now()}`
    const testValue = { test: true, timestamp: Date.now() }
    await redis.set(testKey, testValue, { ex: 10 }) // Expire in 10 seconds

    // Test 2: Get the test key
    const retrieved = await redis.get(testKey)

    // Test 3: Delete the test key
    await redis.del(testKey)

    // Test 4: Check if key was deleted
    const afterDelete = await redis.get(testKey)

    return NextResponse.json({
      success: true,
      message: 'Upstash Redis connecte avec succes',
      connection: {
        url: UPSTASH_REDIS_REST_URL.replace(/\/\/.*@/, '//***@'), // Hide credentials
        authenticated: true
      },
      tests: {
        write: true,
        read: retrieved !== null,
        delete: afterDelete === null
      },
      performance: {
        note: 'Redis fonctionne correctement pour rate limiting et cache'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors du test Redis',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        suggestions: [
          'Verifiez que les credentials sont corrects',
          'Verifiez que le projet Upstash est actif',
          'Verifiez que vous avez installe @upstash/redis'
        ]
      },
      { status: 500 }
    )
  }
}
