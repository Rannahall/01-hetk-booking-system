# 🚀 Quick Start Guide: Rule-Based Booking System

*This guide gets you from zero to a working booking system in under 2 hours. For complete documentation, see the main README.md*

## Prerequisites
- Supabase account
- Stripe account (test mode)
- Node.js 18+ installed
- Basic knowledge of Next.js and PostgreSQL

## Step 1: Database Setup (20 minutes)

### 1.1 Create Supabase Project
```bash
# Create new project at supabase.com
# Note your project URL and anon key
```

### 1.2 Initialize Schema
Copy and run this SQL in your Supabase SQL Editor:

```sql
-- Essential tables for quick start
CREATE TABLE business_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_type TEXT NOT NULL,
    rule_key TEXT NOT NULL,
    rule_value JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE available_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_name TEXT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    base_price_cents INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(court_name, slot_date, start_time)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL REFERENCES available_slots(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    amount_paid_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blocked_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_name TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.3 Insert Initial Rules
```sql
-- Court configuration
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('court_config', 'courts', '{
  "Court A": {"offset_minutes": 0},
  "Court B": {"offset_minutes": 30}
}'),
('court_config', 'slot_duration', '{"minutes": 90}'),
('court_config', 'operating_hours', '{"start": "07:00", "end": "23:00"}');

-- Simple pricing
INSERT INTO business_rules (rule_type, rule_key, rule_value) VALUES
('pricing', 'weekday_rates', '{"07:00-17:00": 40, "17:00-23:00": 65}'),
('pricing', 'weekend_rates', '{"07:00-23:00": 65}');
```

### 1.4 Enable RLS (Basic)
```sql
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public to read available slots
CREATE POLICY "Public can view available slots" ON available_slots
FOR SELECT TO public USING (is_available = TRUE);

-- Allow service role to manage everything
CREATE POLICY "Service role full access" ON available_slots
FOR ALL TO service_role USING (TRUE);

CREATE POLICY "Service role bookings" ON bookings
FOR ALL TO service_role USING (TRUE);
```

## Step 2: Next.js Project Setup (15 minutes)

### 2.1 Create Project
```bash
npx create-next-app@latest booking-system --typescript --tailwind --eslint --app
cd booking-system
npm install @supabase/supabase-js stripe @stripe/stripe-js
```

### 2.2 Environment Variables
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 2.3 Supabase Client
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service client for API routes
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

## Step 3: Core Functions (30 minutes)

### 3.1 Slot Generation API
Create `app/api/generate-slots/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json()
    
    // Get court configuration
    const { data: courtConfig } = await supabaseAdmin
      .from('business_rules')
      .select('rule_value')
      .eq('rule_type', 'court_config')
      .eq('rule_key', 'courts')
      .single()

    const courts = courtConfig?.rule_value || {}
    const slots = []
    
    // Generate slots for each court and date
    for (const [courtName, config] of Object.entries(courts)) {
      const courtSlots = await generateSlotsForCourt(
        courtName, 
        config as any, 
        startDate, 
        endDate
      )
      slots.push(...courtSlots)
    }
    
    // Insert slots (upsert to handle duplicates)
    const { data, error } = await supabaseAdmin
      .from('available_slots')
      .upsert(slots, { onConflict: 'court_name,slot_date,start_time' })
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      slotsCreated: slots.length 
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}

async function generateSlotsForCourt(
  courtName: string, 
  config: { offset_minutes: number },
  startDate: string,
  endDate: string
) {
  const slots = []
  const currentDate = new Date(startDate)
  const endDateObj = new Date(endDate)
  
  while (currentDate <= endDateObj) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
    const price = isWeekend ? 65 : 40 // Simplified pricing
    
    // Generate slots from 7 AM to 11 PM, 90-minute duration
    for (let hour = 7; hour < 23; hour += 1.5) {
      const startHour = Math.floor(hour + config.offset_minutes / 60)
      const startMin = (hour % 1) * 60 + config.offset_minutes % 60
      
      if (startHour >= 23) break
      
      const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`
      const endTime = `${(startHour + 1).toString().padStart(2, '0')}:${((startMin + 30) % 60).toString().padStart(2, '0')}`
      
      slots.push({
        court_name: courtName,
        slot_date: currentDate.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        base_price_cents: price * 100
      })
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slots
}
```

### 3.2 Booking API
Create `app/api/book-slot/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { slotId, customerName, customerEmail, customerPhone } = await request.json()
    
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
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## Step 4: Basic Frontend (25 minutes)

### 4.1 Slot Display Component
Create `components/SlotPicker.tsx`:
```typescript
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Slot {
  id: string
  court_name: string
  slot_date: string
  start_time: string
  end_time: string
  base_price_cents: number
}

export default function SlotPicker() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlots()
  }, [])

  async function fetchSlots() {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('is_available', true)
      .gte('slot_date', today)
      .lte('slot_date', nextWeek.toISOString().split('T')[0])
      .order('slot_date')
      .order('start_time')
    
    if (data) setSlots(data)
    setLoading(false)
  }

  if (loading) return <div>Loading slots...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book Your Court</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['Court A', 'Court B'].map(courtName => (
          <div key={courtName} className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">{courtName}</h2>
            <div className="space-y-2">
              {slots
                .filter(slot => slot.court_name === courtName)
                .map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-3 rounded border text-left ${
                      selectedSlot?.id === slot.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{slot.slot_date} {slot.start_time}</span>
                      <span className="font-semibold">
                        €{(slot.base_price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedSlot && (
        <BookingForm slot={selectedSlot} />
      )}
    </div>
  )
}

function BookingForm({ slot }: { slot: Slot }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Redirect to Stripe payment (simplified)
        alert('Booking created! In production, redirect to payment.')
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      alert('Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Book Selected Slot</h3>
      <p className="mb-4">
        {slot.court_name} - {slot.slot_date} {slot.start_time} - {slot.end_time}
        <br />
        <span className="font-bold">€{(slot.base_price_cents / 100).toFixed(2)}</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  )
}
```

### 4.2 Main Page
Update `app/page.tsx`:
```typescript
import SlotPicker from '@/components/SlotPicker'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <SlotPicker />
    </main>
  )
}
```

## Step 5: Test Your System (10 minutes)

### 5.1 Generate Initial Slots
```bash
# Start your dev server
npm run dev

# In another terminal, generate slots for next week
curl -X POST http://localhost:3000/api/generate-slots \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "'$(date +%Y-%m-%d)'",
    "endDate": "'$(date -d "+7 days" +%Y-%m-%d)'"
  }'
```

### 5.2 Test the Booking Flow
1. Visit `http://localhost:3000`
2. Select a court slot
3. Fill in customer details
4. Click "Proceed to Payment"
5. Check your Supabase dashboard for the booking record

## What's Next?

You now have a working booking system! To enhance it:

1. **Add Stripe Payment UI** - Integrate Stripe Elements for real payments
2. **Add Admin Interface** - Create pages to block slots and view bookings
3. **Implement Webhooks** - Handle payment confirmations properly
4. **Add Real-time Updates** - Use Supabase subscriptions
5. **Deploy** - Move to production with Vercel + Supabase

## Quick Commands

```bash
# Generate slots for next 30 days
curl -X POST http://localhost:3000/api/generate-slots \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "'$(date +%Y-%m-%d)'",
    "endDate": "'$(date -d "+30 days" +%Y-%m-%d)'"
  }'

# Check generated slots in Supabase
# Go to your Supabase dashboard > Table Editor > available_slots

# View bookings
# Go to your Supabase dashboard > Table Editor > bookings
```

## Troubleshooting

**Slots not appearing?**
- Check if you ran the slot generation API
- Verify your database has the correct business rules
- Check browser console for errors

**Booking fails?**
- Ensure RLS policies allow the operations
- Check API routes are returning correct responses
- Verify Stripe keys are set correctly

**Database errors?**
- Make sure all extensions are enabled
- Check if tables were created successfully
- Verify environment variables are correct

---

*For the complete production-ready implementation with Edge Functions, advanced RLS, monitoring, and more, see the main README.md*
