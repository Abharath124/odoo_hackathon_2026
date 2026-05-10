import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

function FieldError({ message }) {
  return message ? <p className="text-xs text-red-400 mt-0.5">{message}</p> : null
}

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

  const inputCls = (err) =>
    `w-full border rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      err ? 'border-red-400 focus:ring-red-300' : 'border-zinc-200 focus:ring-blue-300'
    }`

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primary">Plan a new trip</h1>
        <p className="text-sm text-secondary mt-0.5">Fill in the details to create your trip</p>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-100 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-secondary">Trip Name</label>
          <input type="text" placeholder="e.g. Europe Adventure" {...register('title')} className={inputCls(errors.title)} />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-secondary">Destination</label>
          <input type="text" placeholder="e.g. Paris, Tokyo, Bali..." {...register('destination')} className={inputCls(errors.destination)} />
          <FieldError message={errors.destination?.message} />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-secondary">Start Date</label>
            <input type="date" {...register('startDate')} className={inputCls(errors.startDate)} />
            <FieldError message={errors.startDate?.message} />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-secondary">End Date</label>
            <input type="date" {...register('endDate')} className={inputCls(errors.endDate)} />
            <FieldError message={errors.endDate?.message} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-secondary">Budget ($)</label>
          <input type="number" placeholder="e.g. 3000" {...register('budget')} className={inputCls(false)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-secondary">Description</label>
          <textarea rows={3} placeholder="Brief description of your trip..." {...register('description')} className={`${inputCls(false)} resize-none`} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all disabled:opacity-50" style={{ background: '#4285F4' }}>
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
