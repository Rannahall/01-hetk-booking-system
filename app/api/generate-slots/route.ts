import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json()

    // Create admin client for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get court configuration
    const { data: courtConfig } = await supabaseAdmin
      .from('business_rules')
      .select('rule_value')
      .eq('rule_type', 'court_config')
      .eq('rule_key', 'courts')
      .single()

    const courts = courtConfig?.rule_value || {}
    const slots: Array<{
      court_name: string
      slot_date: string
      start_time: string
      end_time: string
      base_price_cents: number
    }> = []

    // Generate slots for each court and date
    for (const [courtName, config] of Object.entries(courts)) {
      const courtSlots = await generateSlotsForCourt(
        courtName,
        config as { offset_minutes: number },
        startDate,
        endDate
      )
      slots.push(...courtSlots)
    }

    // Insert slots (upsert to handle duplicates)
    const { error } = await supabaseAdmin
      .from('available_slots')
      .upsert(slots, { onConflict: 'court_name,slot_date,start_time' })

    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      slotsCreated: slots.length 
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
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
  const slots: Array<{
    court_name: string
    slot_date: string
    start_time: string
    end_time: string
    base_price_cents: number
  }> = []
  const currentDate = new Date(startDate)
  const endDateObj = new Date(endDate)

  while (currentDate <= endDateObj) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6
    const price = isWeekend ? 65 : 40 // Simplified pricing

    // Generate slots from 7 AM to 11 PM, 90-minute duration
    for (let hour = 7; hour < 23; hour += 1.5) {
      const totalMinutes = hour * 60 + config.offset_minutes
      const startHour = Math.floor(totalMinutes / 60)
      const startMin = totalMinutes % 60

      if (startHour >= 23) break

      const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:00`
      const endTotalMinutes = totalMinutes + 90 // 90-minute slots
      const endHour = Math.floor(endTotalMinutes / 60)
      const endMin = endTotalMinutes % 60
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}:00`

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
