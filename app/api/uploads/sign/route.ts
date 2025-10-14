import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Zod validation schema for upload request
const UploadSignSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
  bucket: z.enum(['listing-images', 'listing-docs', 'avatars']),
})

type UploadSignData = z.infer<typeof UploadSignSchema>

// Initialize Supabase client (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// File size limits (in bytes)
const MAX_FILE_SIZES = {
  'listing-images': 10 * 1024 * 1024, // 10MB
  'listing-docs': 5 * 1024 * 1024, // 5MB
  'avatars': 2 * 1024 * 1024, // 2MB
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces
  const cleanName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now()
  const extension = cleanName.split('.').pop()
  const nameWithoutExt = cleanName.split('.').slice(0, -1).join('.')

  return `${timestamp}_${nameWithoutExt}.${extension}`
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = UploadSignSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const uploadData = validationResult.data

    // Check file size limit
    const maxSize = MAX_FILE_SIZES[uploadData.bucket]
    if (uploadData.fileSize > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Check file type
    if (uploadData.bucket === 'listing-images' || uploadData.bucket === 'avatars') {
      if (!ALLOWED_IMAGE_TYPES.includes(uploadData.fileType)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
          { status: 400 }
        )
      }
    } else if (uploadData.bucket === 'listing-docs') {
      if (!ALLOWED_DOC_TYPES.includes(uploadData.fileType)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only PDF and image documents are allowed.' },
          { status: 400 }
        )
      }
    }

    // Sanitize filename
    const safeFileName = sanitizeFileName(uploadData.fileName)

    // Generate path based on bucket
    let filePath = ''
    if (uploadData.bucket === 'listing-images' || uploadData.bucket === 'listing-docs') {
      filePath = `${user.id}/${safeFileName}`
    } else if (uploadData.bucket === 'avatars') {
      filePath = `${user.id}/avatar_${safeFileName}`
    }

    // Generate signed URL (valid for 60 minutes)
    const { data: signedData, error: signError } = await supabase
      .storage
      .from(uploadData.bucket)
      .createSignedUploadUrl(filePath, {
        upsert: true,
      })

    if (signError) {
      console.error('Signed URL generation error:', signError)
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      )
    }

    // Return signed URL and file path
    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      token: signedData.token,
      path: signedData.path,
      bucket: uploadData.bucket,
      expiresIn: 3600, // 60 minutes
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
