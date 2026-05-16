import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'

const schema = z.object({
  title: z.string().min(2, 'Trip name is required'),
  destination: z.string().min(2, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budget: z.string().optional(),
  description: z.string().optional(),
}).refine((d) => new Date(d.startDate) <= new Date(d.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export default function CreateTrip() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setError('')
    try {
      const { data: res } = await api.post('/trips', {
        title: data.title,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget || null,
        description: data.description || null,
        status: 'planned',
      })
      navigate('/trips')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip')
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primary">Plan a new trip</h1>
        <p className="text-sm text-secondary mt-0.5">Fill in the details to create your trip</p>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-100 rounded-2xl p-6 flex flex-col gap-4">
        <Input
          id="title"
          label="Trip Name"
          type="text"
          placeholder="e.g. Europe Adventure"
          required
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          id="destination"
          label="Destination"
          type="text"
          placeholder="e.g. Paris, Tokyo, Bali..."
          required
          error={errors.destination?.message}
          {...register('destination')}
        />

        <div className="flex gap-4">
          <Input
            id="startDate"
            label="Start Date"
            type="date"
            required
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            id="endDate"
            label="End Date"
            type="date"
            required
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <Input
          id="budget"
          label="Budget ($)"
          type="number"
          placeholder="e.g. 3000"
          {...register('budget')}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-xs font-medium text-secondary">Description</label>
          <textarea
            id="description"
            rows={3}
            placeholder="Brief description of your trip..."
            {...register('description')}
            className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="!w-auto px-6">
            {isSubmitting ? 'Creating...' : 'Create Trip'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="!w-auto px-6">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
