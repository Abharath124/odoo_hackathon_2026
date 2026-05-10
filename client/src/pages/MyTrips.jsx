import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Calendar, Trash2, Pencil, Eye, Search, SlidersHorizontal, ArrowUpDown, LayoutGrid } from 'lucide-react'

const initialTrips = [
  { id: 1, name: 'Europe Tour', description: 'Paris, Rome, Barcelona — 4 cities across Western Europe', startDate: '2025-06-10', endDate: '2025-06-24', stops: 4, budget: '$3,200', color: '#4285F4', status: 'ongoing' },
  { id: 2, name: 'Asia Adventure', description: 'Tokyo, Bangkok, Bali — temples, food and beaches', startDate: '2025-08-05', endDate: '2025-08-18', stops: 3, budget: '$2,800', color: '#34A853', status: 'upcoming' },
  { id: 3, name: 'Beach Getaway', description: 'Maldives, Phuket — sun, sand and relaxation', startDate: '2025-01-01', endDate: '2025-01-07', stops: 2, budget: '$1,500', color: '#FBBC05', status: 'completed' },
  { id: 4, name: 'Desert Safari', description: 'Dubai, Abu Dhabi — dunes, culture and luxury', startDate: '2025-02-10', endDate: '2025-02-17', stops: 2, budget: '$2,100', color: '#EA4335', status: 'completed' },
]

const statusConfig = {
  ongoing:   { label: 'Ongoing',   color: '#34A853', bg: '#34A85318' },
  upcoming:  { label: 'Up-coming', color: '#4285F4', bg: '#4285F418' },
  completed: { label: 'Completed', color: '#5F6368', bg: '#5F636818' },
}

function TripCard({ trip, onDelete }) {
  const cfg = statusConfig[trip.status]
  return (
    <div className="bg-white border border-zinc-100 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: trip.color }} />
            <h3 className="text-sm font-bold text-primary">{trip.name}</h3>
          </div>
          <p className="text-xs text-secondary leading-relaxed">{trip.description}</p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-secondary">
        <span className="flex items-center gap-1"><Calendar size={11} />{trip.startDate} → {trip.endDate}</span>
        <span className="flex items-center gap-1"><MapPin size={11} />{trip.stops} stops</span>
        <span className="font-medium ml-auto" style={{ color: trip.color }}>{trip.budget}</span>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-50">
        <button className="flex items-center gap-1 text-xs text-secondary hover:text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors">
          <Eye size={12} /> View
        </button>
        <button className="flex items-center gap-1 text-xs text-secondary hover:text-yellow-600 px-2 py-1 rounded-md hover:bg-yellow-50 transition-colors">
          <Pencil size={12} /> Edit
        </button>
        <button onClick={() => onDelete(trip.id)} className="flex items-center gap-1 text-xs text-secondary hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 transition-colors ml-auto">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

export default function MyTrips() {
  const [trips, setTrips] = useState(initialTrips)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const deleteTrip = (id) => setTrips((prev) => prev.filter((t) => t.id !== id))

  const filtered = trips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  const groups = ['ongoing', 'upcoming', 'completed']

  return (
    <div className="flex flex-col gap-5 pb-20">

      {/* Search + controls */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bar ....."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <LayoutGrid size={13} /> Group by
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <SlidersHorizontal size={13} /> Filter
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
          <ArrowUpDown size={13} /> Sort by...
        </button>
      </div>

      {/* Grouped sections */}
      {groups.map((status) => {
        const group = filtered.filter((t) => t.status === status)
        if (group.length === 0) return null
        const cfg = statusConfig[status]
        return (
          <div key={status} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-xs text-secondary">{group.length} trip{group.length > 1 ? 's' : ''}</span>
            </div>
            {group.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
            ))}
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-4xl">✈️</span>
          <p className="text-sm text-secondary">No trips found.</p>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => navigate('/trips/new')}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        style={{ background: '#4285F4' }}
      >
        <Plus size={16} /> Plan New Trip
      </button>

    </div>
  )
}
