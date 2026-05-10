import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Plus, MapPin, Clock, Star, Compass, Landmark, Utensils, Mountain, Users } from 'lucide-react'
import api from '../utils/api'

const typeColors = {
  Adventure: '#EA4335', Landmark: '#4285F4', History: '#FBBC05',
  Culture: '#34A853', Nature: '#34A853', Food: '#FBBC05', place: '#4285F4',
}

const typeIcons = {
  Adventure: Mountain,
  Landmark: Landmark,
  History: Landmark,
  Culture: Users,
  Nature: Mountain,
  Food: Utensils,
  place: Compass,
}

export default function ActivitySearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [added, setAdded] = useState([])

  const fetchActivities = (q = '') => {
    setLoading(true)
    const params = q ? `?search=${q}` : ''
    api.get(`/activities${params}`).then((r) => setResults(r.data.activities || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchActivities() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchActivities(search)
  }

  const toggleAdd = (id) => setAdded((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])

  return (
    <div className="flex flex-col gap-5 pb-10">
      <form onSubmit={handleSearch} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities, cities..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
          </div>
          <button type="button" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><LayoutGrid size={13} /> Group by</button>
          <button type="button" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><SlidersHorizontal size={13} /> Filter</button>
          <button type="button" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><ArrowUpDown size={13} /> Sort by...</button>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-primary">Results</span>
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-secondary">{results.length} found</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="text-sm text-secondary">Loading...</span></div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Compass size={32} className="text-secondary" />
              <p className="text-sm text-secondary">No results found.</p>
            </div>
          ) : (
            results.map((item) => {
              const isAdded = added.includes(item.id)
              const color = typeColors[item.type] || typeColors[item.category] || '#4285F4'
              const IconComponent = typeIcons[item.type] || typeIcons[item.category] || Compass
              
              return (
                <div key={item.id} className="bg-white border border-zinc-100 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${color}15` }}>
                      {item.image ? (
                        <img src={`http://localhost:5000${item.image}`} className="w-full h-full object-cover rounded-xl" alt={item.name} />
                      ) : (
                        <IconComponent size={20} style={{ color }} />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-primary">{item.name}</p>
                      <div className="flex items-center gap-3 text-xs text-secondary">
                        <span className="flex items-center gap-1"><MapPin size={11} />{item.destination}{item.country ? `, ${item.country}` : ''}</span>
                        {item.duration && <span className="flex items-center gap-1"><Clock size={11} />{item.duration}</span>}
                        {item.rating && <span className="flex items-center gap-1"><Star size={11} style={{ color: '#FBBC05' }} />{item.rating}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${color}15`, color }}>{item.type || item.category}</span>
                    <button onClick={() => toggleAdd(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={isAdded ? { background: '#34A85318', color: '#34A853', border: '1px solid #34A85340' } : { background: '#4285F418', color: '#4285F4', border: '1px solid #4285F440' }}>
                      <Plus size={12} />{isAdded ? 'Added' : 'Add to Trip'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
