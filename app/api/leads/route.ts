import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Zod validation schema for lead submission
const LeadSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number must be at least 9 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  visit_date: z.string().optional(),
})

type LeadData = z.infer<typeof LeadSchema>

// Initialize Supabase client (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Email service configuration (Resend or SendGrid)
const RESEND_API_KEY = process.env.RESEND_API_KEY
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

async function sendEmailNotification(leadData: LeadData, propertyTitle: string, sellerEmail: string) {
  // Email sending implementation
  // Using Resend as primary, SendGrid as fallback

  if (RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SenImmobilier <noreply@senimmobilier.sn>',
          to: sellerEmail,
          subject: `Nouveau contact pour: ${propertyTitle}`,
          html: `
            <h2>Nouveau contact intéressé par votre propriété</h2>
            <p><strong>Propriété:</strong> ${propertyTitle}</p>
            <hr />
            <p><strong>Nom:</strong> ${leadData.name}</p>
            <p><strong>Email:</strong> ${leadData.email}</p>
            <p><strong>Téléphone:</strong> ${leadData.phone}</p>
            ${leadData.visit_date ? `<p><strong>Date de visite souhaitée:</strong> ${leadData.visit_date}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${leadData.message}</p>
            <hr />
            <p><small>Cet email a été envoyé automatiquement depuis SenImmobilier.</small></p>
          `,
        }),
      })

      if (!response.ok) {
        throw new Error('Resend API error')
      }

      return { success: true, provider: 'resend' }
    } catch (error) {
      console.error('Resend email error:', error)
      // Fall through to SendGrid if available
    }
  }

  if (SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: sellerEmail }],
            subject: `Nouveau contact pour: ${propertyTitle}`,
          }],
          from: { email: 'noreply@senimmobilier.sn', name: 'SenImmobilier' },
          content: [{
            type: 'text/html',
            value: `
              <h2>Nouveau contact intéressé par votre propriété</h2>
              <p><strong>Propriété:</strong> ${propertyTitle}</p>
              <hr />
              <p><strong>Nom:</strong> ${leadData.name}</p>
              <p><strong>Email:</strong> ${leadData.email}</p>
              <p><strong>Téléphone:</strong> ${leadData.phone}</p>
              ${leadData.visit_date ? `<p><strong>Date de visite souhaitée:</strong> ${leadData.visit_date}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p>${leadData.message}</p>
              <hr />
              <p><small>Cet email a été envoyé automatiquement depuis SenImmobilier.</small></p>
            `,
          }],
        }),
      })

      if (!response.ok) {
        throw new Error('SendGrid API error')
      }

      return { success: true, provider: 'sendgrid' }
    } catch (error) {
      console.error('SendGrid email error:', error)
    }
  }

  console.warn('No email service configured')
  return { success: false, provider: 'none' }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = LeadSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const leadData = validationResult.data

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, user_id')
      .eq('id', leadData.property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Get seller email
    const { data: seller, error: sellerError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', property.user_id)
      .single()

    if (sellerError || !seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Save lead to database
    const { data: savedLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        property_id: leadData.property_id,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        message: leadData.message,
        visit_date: leadData.visit_date || null,
        status: 'new',
      })
      .select()
      .single()

    if (leadError) {
      console.error('Failed to save lead:', leadError)
      return NextResponse.json(
        { error: 'Failed to save contact request' },
        { status: 500 }
      )
    }

    // Send email notification to seller
    const emailResult = await sendEmailNotification(
      leadData,
      property.title,
      seller.email
    )

    return NextResponse.json({
      success: true,
      lead: savedLead,
      emailSent: emailResult.success,
      message: 'Votre demande a été envoyée avec succès. Le vendeur vous contactera bientôt.',
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
