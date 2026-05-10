import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Plus, MapPin, Clock, DollarSign, Star } from 'lucide-react'

const schema = z.object({
  query: z.string().min(1, 'Enter a search term'),
})

const allResults = [
  { id: 1, name: 'Paragliding over the Alps', city: 'Interlaken', country: 'Switzerland', type: 'Adventure', duration: '3h', cost: '$120', rating: 4.9, emoji: '🪂' },
  { id: 2, name: 'Paragliding at Bir Billing', city: 'Bir', country: 'India', type: 'Adventure', duration: '2h', cost: '$45', rating: 4.7, emoji: '🪂' },
  { id: 3, name: 'Eiffel Tower Visit', city: 'Paris', country: 'France', type: 'Landmark', duration: '2h', cost: '$25', rating: 4.8, emoji: '🗼' },
  { id: 4, name: 'Colosseum Guided Tour', city: 'Rome', country: 'Italy', type: 'History', duration: '2.5h', cost: '$30', rating: 4.6, emoji: '🏛️' },
  { id: 5, name: 'Bali Temple Hopping', city: 'Bali', country: 'Indonesia', type: 'Culture', duration: '4h', cost: '$35', rating: 4.5, emoji: '⛩️' },
  { id: 6, name: 'Northern Lights Tour', city: 'Reykjavik', country: 'Iceland', type: 'Nature', duration: '5h', cost: '$95', rating: 4.9, emoji: '🌌' },
  { id: 7, name: 'Grand Canyon Hike', city: 'Arizona', country: 'USA', type: 'Nature', duration: '6h', cost: '$20', rating: 4.7, emoji: '🏜️' },
  { id: 8, name: 'Tokyo Street Food Tour', city: 'Tokyo', country: 'Japan', type: 'Food', duration: '3h', cost: '$55', rating: 4.8, emoji: '🍜' },
]

const typeColors = {
  Adventure: '#EA4335',
  Landmark: '#4285F4',
  History: '#FBBC05',
  Culture: '#34A853',
  Nature: '#34A853',
  Food: '#FBBC05',
}

export default function ActivitySearch() {
  const [results, setResults] = useState(allResults)
  const [searched, setSearched] = useState(false)
  const [added, setAdded] = useState([])

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { query: 'Paragliding' },
  })

  const query = watch('query')

  const onSubmit = ({ query }) => {
    const q = query.toLowerCase()
    setResults(allResults.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    ))
    setSearched(true)
  }

  const toggleAdd = (id) =>
    setAdded((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])

  return (
    <div className="flex flex-col gap-5 pb-10">

      {/* Search bar + controls */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              {...register('query')}
              placeholder="Search activities, cities..."
              className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                errors.query ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'
              }`}
            />
          </div>
          <button type="button" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
            <LayoutGrid size={13} /> Group by
          </button>
          <button type="button" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
            <SlidersHorizontal size={13} /> Filter
          </button>
          <button type="button" className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors">
            <ArrowUpDown size={13} /> Sort by...
          </button>
        </div>
        {errors.query && <p className="text-xs text-red-400 pl-1">{errors.query.message}</p>}
      </form>

      {/* Results label */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-primary">Results</span>
        <div className="flex-1 h-px bg-zinc-200" />
        {searched && <span className="text-xs text-secondary">{results.length} found</span>}
      </div>

      {/* Results list */}
      <div className="flex flex-col gap-3">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-3xl">🔍</span>
            <p className="text-sm text-secondary">No results found. Try a different search.</p>
          </div>
        ) : (
          results.map((item) => {
            const isAdded = added.includes(item.id)
            const color = typeColors[item.type] || '#4285F4'
            return (
              <div
                key={item.id}
                className="bg-white border border-zinc-100 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-md transition-all"
              >
                {/* Left: emoji + details */}
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${color}15` }}>
                    {item.emoji}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-primary">{item.name}</p>
                    <div className="flex items-center gap-3 text-xs text-secondary">
                      <span className="flex items-center gap-1"><MapPin size={11} />{item.city}, {item.country}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{item.duration}</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} />{item.cost}</span>
                      <span className="flex items-center gap-1"><Star size={11} style={{ color: '#FBBC05' }} />{item.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Right: type badge + add button */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${color}15`, color }}>
                    {item.type}
                  </span>
                  <button
                    onClick={() => toggleAdd(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={isAdded
                      ? { background: '#34A85318', color: '#34A853', border: '1px solid #34A85340' }
                      : { background: '#4285F418', color: '#4285F4', border: '1px solid #4285F440' }
                    }
                  >
                    <Plus size={12} />
                    {isAdded ? 'Added' : 'Add to Trip'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
