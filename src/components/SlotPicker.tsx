'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardBody, CardHeader, Button, Chip, Divider, Spinner, Input } from '@heroui/react'
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline'

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Book Your Beach Volleyball Court
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Elite indoor beach volleyball facility in Estonia. Book your perfect training session.
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-4 h-4" />
            <span>Tallinn, Estonia</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            <span>90-minute sessions</span>
          </div>
        </div>
      </div>

      {/* Courts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {['Court A', 'Court B'].map(courtName => (
          <Card key={courtName} className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{courtName}</h2>
                <Chip
                  color={courtName === 'Court A' ? 'primary' : 'secondary'}
                  variant="flat"
                >
                  {courtName === 'Court A' ? 'Starts :00' : 'Starts :30'}
                </Chip>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
              {slots
                .filter(slot => slot.court_name === courtName)
                .slice(0, 6) // Show first 6 slots
                .map(slot => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? "solid" : "bordered"}
                    color={selectedSlot?.id === slot.id ? "primary" : "default"}
                    size="lg"
                    className="justify-between h-16 w-full"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">
                        {new Date(slot.slot_date).toLocaleDateString('et-EE')}
                      </span>
                      <span className="text-sm opacity-75">
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">
                        €{(slot.base_price_cents / 100).toFixed(0)}
                      </span>
                    </div>
                  </Button>
                ))}

              {slots.filter(slot => slot.court_name === courtName).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No available slots for this court</p>
                </div>
              )}
            </CardBody>
          </Card>
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          slotId: slot.id,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone
        })
      })

      const result = await response.json()

      if (result.success) {
        window.location.href = result.checkoutUrl
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
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">Complete Your Booking</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Court:</span> {slot.court_name}
              </div>
              <div>
                <span className="font-medium">Date:</span> {slot.slot_date}
              </div>
              <div>
                <span className="font-medium">Time:</span> {slot.start_time} - {slot.end_time}
              </div>
              <div>
                <span className="font-medium text-green-600 text-lg">
                  Price: €{(slot.base_price_cents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            isRequired
            size="lg"
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            isRequired
            size="lg"
          />

          <Input
            type="tel"
            label="Phone Number"
            placeholder="+372 5XXX XXXX"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            isRequired
            size="lg"
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full text-lg"
            isLoading={loading}
          >
            {loading ? 'Creating Booking...' : 'Proceed to Stripe Checkout'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
