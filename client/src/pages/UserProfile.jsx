import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Check, X, Eye } from 'lucide-react'
import api from '../utils/api'
import { fetchMe } from '../store/authSlice'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

function TripCard({ trip }) {
  const navigate = useNavigate()
  const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
  const color = colors[trip.id % 4]
  return (
    <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-all">
      <div className="flex-1 flex items-center justify-center text-4xl py-8" style={{ background: `${color}12` }}>✈️</div>
      <div className="px-3 py-2 border-t border-zinc-100">
        <p className="text-xs font-semibold text-primary truncate">{trip.title}</p>
        <p className="text-xs text-secondary mt-0.5">{trip.startDate} → {trip.endDate}</p>
      </div>
      <div className="px-3 pb-3">
        <button onClick={() => navigate('/trips')} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-secondary hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all">
          <Eye size={12} /> View
        </button>
      </div>
    </div>
  )
}

export default function UserProfile() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [editing, setEditing] = useState(false)
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  })

  useEffect(() => {
    api.get('/trips').then((r) => setTrips(r.data.trips || [])).catch(() => {})
  }, [])

  useEffect(() => {
    reset({ name: user?.name || '', email: user?.email || '' })
  }, [user])

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const onSubmit = async (data) => {
    setError('')
    setSuccess('')
    try {
      await api.put('/users/profile', data)
      await dispatch(fetchMe())
      setSuccess('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const cancelEdit = () => { reset({ name: user?.name || '', email: user?.email || '' }); setEditing(false); setError('') }

  const preplanned = trips.filter((t) => t.status === 'planned').slice(0, 3)
  const previous = trips.filter((t) => t.status === 'completed').slice(0, 3)

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="bg-white border border-zinc-100 rounded-2xl p-6 flex items-start gap-6">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0 border-4 border-white shadow-md overflow-hidden" style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}>
          {user?.avatar ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" /> : initials}
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">User Details</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-secondary hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <Pencil size={12} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button form="profile-form" type="submit" className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-all" style={{ background: '#34A853' }}><Check size={12} /> Save</button>
                <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-secondary hover:bg-zinc-50 transition-all"><X size={12} /> Cancel</button>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}

          {editing ? (
            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-secondary">Full Name</span>
                <input {...register('name')} className={`text-sm text-primary border rounded-lg px-2.5 py-1.5 bg-zinc-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'}`} />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-secondary">Email</span>
                <input {...register('email')} className={`text-sm text-primary border rounded-lg px-2.5 py-1.5 bg-zinc-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'}`} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex flex-col gap-0.5"><span className="text-xs text-secondary">Full Name</span><span className="text-sm font-medium text-primary">{user?.name}</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs text-secondary">Email</span><span className="text-sm font-medium text-primary">{user?.email}</span></div>
              <div className="flex flex-col gap-0.5"><span className="text-xs text-secondary">Role</span><span className="text-sm font-medium text-primary capitalize">{user?.role}</span></div>
            </div>
          )}
        </div>
      </div>

      {preplanned.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3"><span className="text-sm font-semibold text-primary">Planned Trips</span><div className="flex-1 h-px bg-zinc-200" /></div>
          <div className="grid grid-cols-3 gap-4">{preplanned.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>
        </div>
      )}

      {previous.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3"><span className="text-sm font-semibold text-primary">Previous Trips</span><div className="flex-1 h-px bg-zinc-200" /></div>
          <div className="grid grid-cols-3 gap-4">{previous.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>
        </div>
      )}

      {preplanned.length === 0 && previous.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <span className="text-3xl">✈️</span>
          <p className="text-sm text-secondary">No trips yet.</p>
        </div>
      )}
    </div>
  )
}
