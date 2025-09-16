import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { slotId, customerName, customerEmail, customerPhone } = await request.json()

    // Create admin client for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get slot details
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_available', true)
      .single()
    
    if (slotError || !slot) {
      return NextResponse.json(
        { error: 'Slot not available' },
        { status: 400 }
      )
    }
    
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: slot.base_price_cents,
      currency: 'eur',
      metadata: {
        slot_id: slotId,
        customer_email: customerEmail,
      },
    })
    
    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        slot_id: slotId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        stripe_payment_intent_id: paymentIntent.id,
        amount_paid_cents: slot.base_price_cents,
        status: 'pending'
      })
      .select()
      .single()
    
    if (bookingError) throw bookingError
    
    // Mark slot as unavailable
    await supabaseAdmin
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slotId)
    
    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}
