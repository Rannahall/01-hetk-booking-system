export default function BookingConfirmation() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your court booking has been successfully confirmed. You will receive a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <a
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Another Slot
          </a>

          <p className="text-sm text-gray-500">
            Check your email for booking details and any updates.
          </p>
        </div>
      </div>
    </main>
  )
}
