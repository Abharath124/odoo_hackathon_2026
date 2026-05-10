import { useState } from 'react'
import { Plus, MapPin, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

const initialStops = [
  {
    id: 1, city: 'Paris', country: 'France', dates: 'Jan 10 – Jan 14', color: '#4285F4',
    activities: [
      { id: 1, name: 'Eiffel Tower Visit', time: '10:00 AM', cost: '$25', duration: '2h' },
      { id: 2, name: 'Louvre Museum', time: '2:00 PM', cost: '$20', duration: '3h' },
    ],
  },
  {
    id: 2, city: 'Rome', country: 'Italy', dates: 'Jan 15 – Jan 19', color: '#EA4335',
    activities: [
      { id: 1, name: 'Colosseum Tour', time: '9:00 AM', cost: '$18', duration: '2h' },
    ],
  },
]

export default function Itinerary() {
  const [stops, setStops] = useState(initialStops)
  const [expanded, setExpanded] = useState({ 1: true, 2: true })

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  const removeStop = (id) => setStops((prev) => prev.filter((s) => s.id !== id))

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Itinerary Builder</h1>
          <p className="text-sm text-secondary mt-0.5">Organize your trip day by day</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all"
          style={{ background: '#4285F4' }}
        >
          <Plus size={15} /> Add Stop
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {stops.map((stop, idx) => (
          <div key={stop.id} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
            {/* Stop header */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer"
              style={{ borderLeft: `4px solid ${stop.color}` }}
              onClick={() => toggle(stop.id)}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: stop.color }}>
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} style={{ color: stop.color }} />
                    <span className="text-sm font-semibold text-primary">{stop.city}, {stop.country}</span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">{stop.dates}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); removeStop(stop.id) }}
                  className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
                {expanded[stop.id] ? <ChevronUp size={15} className="text-secondary" /> : <ChevronDown size={15} className="text-secondary" />}
              </div>
            </div>

            {/* Activities */}
            {expanded[stop.id] && (
              <div className="px-5 pb-4 flex flex-col gap-2 border-t border-zinc-50">
                {stop.activities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between py-2.5 border-b border-zinc-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-primary">{act.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-secondary"><Clock size={11} />{act.time}</span>
                        <span className="text-xs text-secondary">{act.duration}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: stop.color }}>{act.cost}</span>
                  </div>
                ))}
                <button className="flex items-center gap-1.5 text-xs mt-1 font-medium hover:opacity-80 transition-colors" style={{ color: stop.color }}>
                  <Plus size={13} /> Add Activity
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
