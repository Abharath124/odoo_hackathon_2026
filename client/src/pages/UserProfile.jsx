import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Check, X, Eye } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  location: z.string().min(2, 'Location is required'),
  language: z.string().min(2, 'Language is required'),
})

const preplanned = [
  { id: 1, name: 'Japan Spring', dates: 'Aug 10 – Aug 22', color: '#4285F4', emoji: '🌸' },
  { id: 2, name: 'African Safari', dates: 'Sep 5 – Sep 15', color: '#34A853', emoji: '🦁' },
  { id: 3, name: 'South America', dates: 'Oct 1 – Oct 14', color: '#FBBC05', emoji: '🌎' },
]

const previous = [
  { id: 1, name: 'Europe Tour', dates: 'Jan 10 – Jan 24', color: '#EA4335', emoji: '🗼' },
  { id: 2, name: 'Asia Adventure', dates: 'Mar 5 – Mar 18', color: '#4285F4', emoji: '⛩️' },
  { id: 3, name: 'Beach Getaway', dates: 'Apr 1 – Apr 7', color: '#34A853', emoji: '🌴' },
]

function TripCard({ trip }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-all">
      <div className="flex-1 flex items-center justify-center text-4xl py-8" style={{ background: `${trip.color}12` }}>
        {trip.emoji}
      </div>
      <div className="px-3 py-2 border-t border-zinc-100">
        <p className="text-xs font-semibold text-primary truncate">{trip.name}</p>
        <p className="text-xs text-secondary mt-0.5">{trip.dates}</p>
      </div>
      <div className="px-3 pb-3">
        <button
          onClick={() => navigate('/trips')}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-secondary hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <Eye size={12} /> View
        </button>
      </div>
    </div>
  )
}

export default function UserProfile() {
  const { user } = useSelector((state) => state.auth)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    language: 'English',
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: saved,
  })

  const initials = saved.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const onSubmit = (data) => {
    setSaved(data)
    setEditing(false)
  }

  const cancelEdit = () => {
    reset(saved)
    setEditing(false)
  }

  const inputCls = (err) =>
    `text-sm text-primary border rounded-lg px-2.5 py-1.5 bg-zinc-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      err ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'
    }`

  const fields = [
    { label: 'Full Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Location', key: 'location' },
    { label: 'Language', key: 'language' },
  ]

  return (
    <div className="flex flex-col gap-6 pb-10">

      <div className="bg-white border border-zinc-100 rounded-2xl p-6 flex items-start gap-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0 border-4 border-white shadow-md"
          style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}
        >
          {initials}
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">User Details</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-secondary hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <Pencil size={12} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button form="profile-form" type="submit" className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-all" style={{ background: '#34A853' }}>
                  <Check size={12} /> Save
                </button>
                <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-secondary hover:bg-zinc-50 transition-all">
                  <X size={12} /> Cancel
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-6 gap-y-3">
              {fields.map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-xs text-secondary">{label}</span>
                  <input {...register(key)} className={inputCls(errors[key])} />
                  {errors[key] && <p className="text-xs text-red-400">{errors[key].message}</p>}
                </div>
              ))}
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {fields.map(({ label, key }) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-xs text-secondary">{label}</span>
                    <span className="text-sm font-medium text-primary">{saved[key]}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-secondary mt-1">
                User details with appropriate option to edit those information....
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-primary">Preplanned Trips</span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {preplanned.map((trip) => <TripCard key={trip.id} trip={trip} />)}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-primary">Previous Trips</span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {previous.map((trip) => <TripCard key={trip.id} trip={trip} />)}
        </div>
      </div>

    </div>
  )
}
