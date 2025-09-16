// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=denonext'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('Stripe-Signature')

    if (!signature || !endpointSecret) {
      return new Response('Webhook signature missing', { status: 400 })
    }

    // Get the raw request body for signature verification
    const body = await req.text()

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        endpointSecret,
        undefined,
        Stripe.createSubtleCryptoProvider()
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Checkout session completed:', session.id)

        // Update booking status to confirmed
        const { error: updateError } = await supabaseClient
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('stripe_payment_intent_id', session.id)

        if (updateError) {
          console.error('Error updating booking status:', updateError)
        } else {
          console.log('Booking status updated to confirmed')
        }
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object
        console.log('Checkout session expired:', expiredSession.id)

        // Find and delete the booking, make slot available again
        const { data: expiredBooking } = await supabaseClient
          .from('bookings')
          .select('slot_id')
          .eq('stripe_payment_intent_id', expiredSession.id)
          .single()

        if (expiredBooking) {
          // Delete the booking
          await supabaseClient
            .from('bookings')
            .delete()
            .eq('stripe_payment_intent_id', expiredSession.id)

          // Make slot available again
          await supabaseClient
            .from('available_slots')
            .update({ is_available: true })
            .eq('id', expiredBooking.slot_id)

          console.log('Expired booking cleaned up, slot made available')
        }
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --header 'Stripe-Signature: t=1492774577,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd' \
    --data '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_1234567890"}}}'

*/
