import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  place: z.string().min(2, 'Place must be at least 2 characters'),
  tripStartDate: z.string().min(1, 'Trip start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((d) => new Date(d.tripStartDate) <= new Date(d.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

const suggestions = [
  { id: 1, name: 'Eiffel Tower', place: 'Paris', emoji: '🗼', type: 'Landmark' },
  { id: 2, name: 'Colosseum', place: 'Rome', emoji: '🏛️', type: 'History' },
  { id: 3, name: 'Bali Temples', place: 'Bali', emoji: '⛩️', type: 'Culture' },
  { id: 4, name: 'Safari Tour', place: 'Kenya', emoji: '🦁', type: 'Adventure' },
  { id: 5, name: 'Northern Lights', place: 'Iceland', emoji: '🌌', type: 'Nature' },
  { id: 6, name: 'Grand Canyon', place: 'USA', emoji: '🏜️', type: 'Nature' },
]

function FieldError({ message }) {
  return message ? <p className="text-xs text-red-400 mt-0.5">{message}</p> : null
}

export default function CreateTrip() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const toggleSuggestion = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])

  const onSubmit = () => navigate('/itinerary/build')

  const inputCls = (err) =>
    `w-72 border rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      err ? 'border-red-400 focus:ring-red-300' : 'border-zinc-200 focus:ring-blue-300'
    }`

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-3xl mx-auto">

      <div>
        <h1 className="text-xl font-bold text-primary">Plan a new trip</h1>
        <p className="text-sm text-secondary mt-0.5">Fill in the details to create your itinerary</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Start Date</label>
            <input type="date" {...register('startDate')} className={inputCls(errors.startDate)} />
            <FieldError message={errors.startDate?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Select a Place</label>
            <input type="text" placeholder="e.g. Paris, Tokyo, Bali..." {...register('place')} className={inputCls(errors.place)} />
            <FieldError message={errors.place?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Start Date</label>
            <input type="date" {...register('tripStartDate')} className={inputCls(errors.tripStartDate)} />
            <FieldError message={errors.tripStartDate?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">End Date</label>
            <input type="date" {...register('endDate')} className={inputCls(errors.endDate)} />
            <FieldError message={errors.endDate?.message} />
          </div>

        </div>

        {/* Suggestions */}
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary">Suggestion for Places to Visit / Activities to perform</span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {suggestions.map((s) => {
              const isSelected = selected.includes(s.id)
              return (
                <div
                  key={s.id}
                  onClick={() => toggleSuggestion(s.id)}
                  className="border rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: isSelected ? '#4285F4' : '#f4f4f5', background: isSelected ? '#4285F408' : '#fff' }}
                >
                  <div className="w-full h-24 rounded-lg flex items-center justify-center text-4xl" style={{ background: isSelected ? '#4285F415' : '#f9fafb' }}>
                    {s.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{s.name}</p>
                    <p className="text-xs text-secondary mt-0.5">{s.place}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full self-start" style={{ background: isSelected ? '#4285F418' : '#f4f4f5', color: isSelected ? '#4285F4' : '#5F6368' }}>
                    {s.type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: '#4285F4' }}
          >
            {isSubmitting ? 'Creating...' : 'Create Trip'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-lg text-sm font-medium text-secondary border border-zinc-200 hover:bg-zinc-50 transition-all">
            Cancel
          </button>
        </div>
      </form>

    </div>
  )
}
