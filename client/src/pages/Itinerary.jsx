import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../utils/api'

const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0']

export default function Itinerary() {
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/itineraries').then((r) => {
      setItineraries(r.data.itineraries || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const deleteItinerary = async (id) => {
    try {
      await api.delete(`/itineraries/${id}`)
      setItineraries((prev) => prev.filter((i) => i.id !== id))
    } catch (_) {}
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">My Itineraries</h1>
          <p className="text-sm text-secondary mt-0.5">Organize your trip day by day</p>
        </div>
        <button onClick={() => navigate('/itinerary/build')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all" style={{ background: '#4285F4' }}>
          <Plus size={15} /> New Itinerary
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="text-sm text-secondary">Loading...</span></div>
      ) : itineraries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm text-secondary">No itineraries yet.</p>
          <button onClick={() => navigate('/itinerary/build')} className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ background: '#4285F4' }}>Build your first itinerary</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {itineraries.map((itin, idx) => (
            <div key={itin.id} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer" style={{ borderLeft: `4px solid ${colors[idx % 5]}` }} onClick={() => toggle(itin.id)}>
                <div>
                  <p className="text-sm font-semibold text-primary">{itin.title}</p>
                  {itin.notes && <p className="text-xs text-secondary mt-0.5">{itin.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); deleteItinerary(itin.id) }} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                  {expanded[itin.id] ? <ChevronUp size={15} className="text-secondary" /> : <ChevronDown size={15} className="text-secondary" />}
                </div>
              </div>

              {expanded[itin.id] && itin.sections?.length > 0 && (
                <div className="px-5 pb-4 flex flex-col gap-2 border-t border-zinc-50">
                  {itin.sections.map((sec) => (
                    <div key={sec.id} className="flex items-center justify-between py-2.5 border-b border-zinc-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-primary">{sec.title}</p>
                        <p className="text-xs text-secondary mt-0.5">{sec.dateFrom} → {sec.dateTo}</p>
                      </div>
                      {sec.budget && <span className="text-sm font-semibold" style={{ color: colors[idx % 5] }}>${sec.budget}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
