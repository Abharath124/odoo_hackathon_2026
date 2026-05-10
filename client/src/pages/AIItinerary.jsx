import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

const schema = z.object({
  destination: z.string().min(2, 'Destination required'),
  days: z.coerce.number().min(1, 'At least 1 day').max(30, 'Max 30 days'),
  budget: z.coerce.number().min(100, 'Budget must be at least ₹100'),
})

export default function AIItinerary() {
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [savedItineraries, setSavedItineraries] = useState([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [addingToItinerary, setAddingToItinerary] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetchSavedItineraries()
  }, [])

  const fetchSavedItineraries = async () => {
    try {
      const response = await api.get('/ai/itineraries')
      setSavedItineraries(response.data)
    } catch (err) {
      console.error('Failed to fetch saved itineraries')
    } finally {
      setLoadingSaved(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/ai/itinerary', data)
      setItinerary(response.data)
      reset()
      await fetchSavedItineraries()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate itinerary')
    } finally {
      setLoading(false)
    }
  }

  const handleViewSaved = (item) => {
    setItinerary(item)
    setSuccess('')
    setError('')
  }

  const handleBackToList = () => {
    setItinerary(null)
    setSuccess('')
    setError('')
  }

  const handleAddToItinerary = async () => {
    setAddingToItinerary(true)
    setError('')
    setSuccess('')
    try {
      console.log('Fetching trips...')
      const tripsRes = await api.get('/trips')
      const trips = tripsRes.data.trips || []
      console.log('Trips:', trips)

      if (trips.length === 0) {
        setError('❌ Please create a trip first before adding an itinerary')
        setAddingToItinerary(false)
        return
      }

      const tripId = trips[0].id
      console.log('Using trip ID:', tripId)

      const sections = itinerary.itinerary.days.map((day, idx) => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + idx)
        return {
          title: day.title,
          description: day.activities.join(', '),
          dateFrom: startDate.toISOString().split('T')[0],
          dateTo: startDate.toISOString().split('T')[0],
          budget: day.estimatedCost,
        }
      })

      console.log('Sections:', sections)

      const itineraryData = {
        tripId,
        title: `${itinerary.destination} - ${itinerary.days} Days`,
        sections,
      }

      console.log('Storing data:', itineraryData)
      sessionStorage.setItem('aiItineraryData', JSON.stringify(itineraryData))

      setSuccess('✅ Itinerary added successfully! Redirecting...')
      setTimeout(() => {
        navigate('/itinerary/build')
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      setError('❌ Error: ' + (error.response?.data?.message || error.message))
      setAddingToItinerary(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">AI Itinerary Generator</h1>
        <p className="text-secondary">Let AI plan your perfect trip</p>
      </div>

      {!itinerary ? (
        <>
          <Card className="mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Destination</label>
                  <Input
                    {...register('destination')}
                    placeholder="e.g., Goa, Paris, Tokyo"
                    disabled={loading}
                  />
                  {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Number of Days</label>
                  <Input
                    {...register('days')}
                    type="number"
                    placeholder="3"
                    disabled={loading}
                  />
                  {errors.days && <p className="text-red-500 text-xs mt-1">{errors.days.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Budget (₹)</label>
                  <Input
                    {...register('budget')}
                    type="number"
                    placeholder="15000"
                    disabled={loading}
                  />
                  {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate Itinerary'}
              </Button>
            </form>
          </Card>

          {/* Saved Itineraries Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Your Saved Itineraries</h2>
            {loadingSaved ? (
              <p className="text-secondary">Loading...</p>
            ) : savedItineraries.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-secondary">No saved itineraries yet. Generate your first one!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedItineraries.map((item) => (
                  <Card
                    key={item.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewSaved(item)}
                  >
                    <h3 className="font-bold text-lg text-zinc-900">{item.destination}</h3>
                    <p className="text-sm text-secondary mt-1">{item.days} days • ₹{item.budget}</p>
                    <p className="text-xs text-secondary mt-2">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={handleBackToList}
            className="mb-6 text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
          >
            ← Back to List
          </button>

          <div className="space-y-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">{itinerary.destination}</h2>
                <p className="text-secondary">{itinerary.days} days • ₹{itinerary.budget}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-secondary">Total Estimated Cost</p>
                <p className="text-2xl font-bold text-primary">₹{itinerary.itinerary.totalEstimatedCost}</p>
              </div>
            </div>

            {itinerary.itinerary.days?.map((day) => (
              <Card key={day.day} className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-zinc-900">Day {day.day}: {day.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-zinc-700 mb-2">Activities</h4>
                    <ul className="space-y-1">
                      {day.activities?.map((activity, idx) => (
                        <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-700 mb-2">Meals</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-secondary">Breakfast:</span> {day.meals?.breakfast}</p>
                      <p><span className="text-secondary">Lunch:</span> {day.meals?.lunch}</p>
                      <p><span className="text-secondary">Dinner:</span> {day.meals?.dinner}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-secondary">Transport</p>
                    <p className="text-sm font-medium text-zinc-900">{day.transport}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-secondary">Estimated Cost</p>
                    <p className="text-lg font-bold text-primary">₹{day.estimatedCost}</p>
                  </div>
                </div>
              </Card>
            ))}

            {itinerary.itinerary.tips && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold text-zinc-900 mb-3">💡 Travel Tips</h3>
                <ul className="space-y-2">
                  {itinerary.itinerary.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-secondary flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {success && (
              <Card className="p-4 bg-green-50 border-green-200">
                <p className="text-sm font-medium text-green-700">{success}</p>
              </Card>
            )}

            {error && (
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </Card>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleBackToList}
                className="flex-1 px-4 py-3 rounded-lg border border-zinc-200 text-zinc-900 font-medium hover:bg-zinc-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAddToItinerary}
                disabled={addingToItinerary}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {addingToItinerary ? 'Adding...' : 'Add to My Itineraries'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
