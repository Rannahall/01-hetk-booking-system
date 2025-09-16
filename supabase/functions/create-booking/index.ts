// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { slotId, customerName, customerEmail, customerPhone } = await req.json()

    // Get slot details
    const { data: slot, error: slotError } = await supabaseClient
      .from('available_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_available', true)
      .single()

    if (slotError || !slot) {
      return new Response(
        JSON.stringify({ error: 'Slot not available' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Court Booking - ${slot.court_name}`,
              description: `${slot.slot_date} ${slot.start_time} - ${slot.end_time}`,
            },
            unit_amount: slot.base_price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/`,
      metadata: {
        slot_id: slotId,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
      },
      customer_email: customerEmail,
    })

    // Create booking with pending status
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        slot_id: slotId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        stripe_payment_intent_id: session.id, // Store session ID
        amount_paid_cents: slot.base_price_cents,
        status: 'pending'
      })
      .select()
      .single()

    if (bookingError) {
      throw bookingError
    }

    // Mark slot as unavailable
    await supabaseClient
      .from('available_slots')
      .update({ is_available: false })
      .eq('id', slotId)

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        checkoutUrl: session.url,
        sessionId: session.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Booking error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-booking' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"slotId":"uuid","customerName":"John Doe","customerEmail":"john@example.com","customerPhone":"1234567890"}'

*/
