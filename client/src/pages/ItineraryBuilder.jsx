import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'

const sectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
  budget: z.string().min(1, 'Budget is required').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid amount'),
}).refine((d) => new Date(d.dateFrom) <= new Date(d.dateTo), { message: 'End date must be after start date', path: ['dateTo'] })

const schema = z.object({
  tripId: z.string().min(1, 'Select a trip'),
  title: z.string().min(2, 'Itinerary title is required'),
  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
})

export default function ItineraryBuilder() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tripId: '',
      title: '',
      sections: [{ title: 'Section 1', description: '', dateFrom: '', dateTo: '', budget: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'sections' })

  useEffect(() => {
    api.get('/trips').then((r) => setTrips(r.data.trips || [])).catch(() => {})
    
    // Check if coming from AI Itinerary
    const aiData = sessionStorage.getItem('aiItineraryData')
    if (aiData) {
      try {
        const data = JSON.parse(aiData)
        console.log('Loading AI data:', data)
        reset({
          tripId: data.tripId.toString(),
          title: data.title,
          sections: data.sections,
        })
        sessionStorage.removeItem('aiItineraryData')
      } catch (e) {
        console.error('Error parsing AI data:', e)
      }
    }
  }, [reset])

  const onSubmit = async (data) => {
    setError('')
    try {
      await api.post('/itineraries', {
        tripId: data.tripId,
        title: data.title,
        sections: data.sections.map((s) => ({
          title: s.title,
          description: s.description,
          startDate: s.dateFrom,
          endDate: s.dateTo,
          budget: s.budget,
        })),
      })
      navigate('/itinerary')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save itinerary')
    }
  }

  const inputCls = (err) =>
    `text-xs text-primary bg-transparent focus:outline-none w-full transition-all ${err ? 'placeholder:text-red-300' : 'placeholder:text-zinc-400'}`

  return (
    <div className="flex flex-col gap-5 pb-10 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primary">Build Itinerary</h1>
        <p className="text-sm text-secondary mt-0.5">Add sections for each part of your trip</p>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Select Trip</label>
            <select {...register('tripId')} className="border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-all">
              <option value="">-- Select a trip --</option>
              {trips.map((t) => <option key={t.id} value={t.id}>{t.title} — {t.destination}</option>)}
            </select>
            {errors.tripId && <p className="text-xs text-red-400 mt-0.5">{errors.tripId.message}</p>}
          </div>
          <Input
            id="title"
            label="Itinerary Title"
            placeholder="e.g. Day-by-day Europe Plan"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>

        {fields.map((field, idx) => {
          const err = errors.sections?.[idx]
          return (
            <div key={field.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <input {...register(`sections.${idx}.title`)} className={`text-sm font-semibold text-primary bg-transparent focus:outline-none border-b transition-all w-40 ${err?.title ? 'border-red-400' : 'border-transparent focus:border-zinc-300'}`} />
                  {err?.title && <p className="text-xs text-red-400 mt-0.5">{err.title.message}</p>}
                </div>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(idx)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <textarea rows={2} {...register(`sections.${idx}.description`)} placeholder="Description of this section..." className={`w-full text-sm text-primary bg-zinc-50 border rounded-lg px-3.5 py-2.5 resize-none placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:bg-white focus:border-transparent transition-all ${err?.description ? 'border-red-400 focus:ring-red-400' : 'border-zinc-100 focus:ring-primary'}`} />
                {err?.description && <p className="text-xs text-red-400 mt-0.5">{err.description.message}</p>}
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-0.5 flex-1">
                  <div className={`flex items-center gap-2 border rounded-lg px-3.5 py-2.5 bg-zinc-50 ${err?.dateFrom || err?.dateTo ? 'border-red-400' : 'border-zinc-200'}`}>
                    <span className="text-xs text-secondary whitespace-nowrap">Date Range:</span>
                    <input type="date" {...register(`sections.${idx}.dateFrom`)} className={inputCls(err?.dateFrom)} />
                    <span className="text-xs text-secondary">to</span>
                    <input type="date" {...register(`sections.${idx}.dateTo`)} className={inputCls(err?.dateTo)} />
                  </div>
                  {(err?.dateFrom || err?.dateTo) && <p className="text-xs text-red-400 mt-0.5">{err?.dateFrom?.message || err?.dateTo?.message}</p>}
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <div className={`flex items-center gap-2 border rounded-lg px-3.5 py-2.5 bg-zinc-50 ${err?.budget ? 'border-red-400' : 'border-zinc-200'}`}>
                    <span className="text-xs text-secondary whitespace-nowrap">Budget:</span>
                    <input type="number" placeholder="0.00" {...register(`sections.${idx}.budget`)} className={inputCls(err?.budget)} />
                    <span className="text-xs text-secondary">$</span>
                  </div>
                  {err?.budget && <p className="text-xs text-red-400 mt-0.5">{err.budget.message}</p>}
                </div>
              </div>
            </div>
          )
        })}

        <button type="button" onClick={() => append({ title: `Section ${fields.length + 1}`, description: '', dateFrom: '', dateTo: '', budget: '' })} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-medium text-secondary hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
          <Plus size={15} /> Add another Section
        </button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Itinerary'}
        </Button>
      </form>
    </div>
  )
}
