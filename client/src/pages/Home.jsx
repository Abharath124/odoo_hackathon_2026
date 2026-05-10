import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Plus } from 'lucide-react'
import api from '../utils/api'

const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#4285F4']

export default function Home() {
  const { user } = useSelector((state) => state.auth)
  const [search, setSearch] = useState('')
  const [destinations, setDestinations] = useState([])
  const [trips, setTrips] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/destinations/top-regional').then((r) => setDestinations(r.data.destinations || [])).catch(() => {})
    api.get('/trips?sortBy=createdAt&order=DESC').then((r) => setTrips(r.data.trips || [])).catch(() => {})
  }, [])

  const filtered = trips.filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-sm" style={{ background: 'linear-gradient(135deg, #7986CB 0%, #9FA8DA 40%, #C5CAE9 70%, #E8EAF6 100%)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(100,116,196,0.92) 25%, rgba(100,116,196,0.5) 55%, transparent 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back{user?.name ? `, ${user.name}` : ''}! ✈️</h1>
          <p className="text-sm text-white/80 mt-1">Where do you want to go next?</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trips..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><LayoutGrid size={13} /> Group by</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><SlidersHorizontal size={13} /> Filter</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><ArrowUpDown size={13} /> Sort by...</button>
      </div>

      {destinations.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-primary">Top Regional Selections</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {destinations.slice(0, 5).map((dest, i) => (
              <div key={dest.id} className="bg-white border border-zinc-100 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" style={{ borderTop: `3px solid ${colors[i]}` }}>
                <span className="text-2xl">🌍</span>
                <p className="text-xs font-semibold text-primary text-center">{dest.name}</p>
                <p className="text-xs text-secondary text-center">{dest.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-primary">My Trips</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {filtered.slice(0, 6).map((trip, i) => (
              <div key={trip.id} onClick={() => navigate('/trips')} className="bg-white border border-zinc-100 rounded-xl p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-full h-20 rounded-lg flex items-center justify-center text-3xl" style={{ background: `${colors[i % 5]}18` }}>✈️</div>
                <div>
                  <p className="text-sm font-semibold text-primary">{trip.title}</p>
                  <p className="text-xs text-secondary mt-0.5">{trip.destination}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-secondary">{trip.startDate} → {trip.endDate}</span>
                  <span className="text-xs font-medium" style={{ color: colors[i % 5] }}>{trip.budget ? `$${trip.budget}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && !search && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">✈️</span>
          <p className="text-sm text-secondary">No trips yet. Plan your first trip!</p>
        </div>
      )}

      <button onClick={() => navigate('/trips/new')} className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all" style={{ background: '#4285F4' }}>
        <Plus size={16} /> Plan a trip
      </button>
    </div>
  )
}
