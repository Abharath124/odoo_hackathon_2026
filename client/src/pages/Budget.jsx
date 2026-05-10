import { useEffect, useState } from 'react'
import { Plane, Hotel, Utensils, Ticket, AlertCircle } from 'lucide-react'
import api from '../utils/api'

const categoryIcons = { Transport: Plane, Stay: Hotel, Meals: Utensils, Activities: Ticket }
const categoryColors = { Transport: '#4285F4', Stay: '#34A853', Meals: '#FBBC05', Activities: '#EA4335', General: '#9C27B0' }

export default function Budget() {
  const [itineraries, setItineraries] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [dayPlans, setDayPlans] = useState([])
  const [byCategory, setByCategory] = useState({})
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState(null)

  useEffect(() => {
    api.get('/itineraries').then((r) => {
      const list = r.data.itineraries || []
      setItineraries(list)
      if (list.length) setSelectedId(String(list[0].id))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    api.get(`/budget/${selectedId}`).then((r) => {
      setDayPlans(r.data.dayPlans || [])
      setByCategory(r.data.byCategory || {})
      setTotalSpent(r.data.totalBudget || 0)
      setItinerary(r.data.itinerary)
      // get trip budget from backend response
      setTotalBudget(r.data.itinerary?.trip?.budget || 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [selectedId])

  const overBudget = totalBudget > 0 && totalSpent > totalBudget
  const categories = Object.entries(byCategory)

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Trip Budget</h1>
          <p className="text-sm text-secondary mt-0.5">Cost breakdown and estimates</p>
        </div>
        {itineraries.length > 0 && (
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all">
            {itineraries.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="text-sm text-secondary">Loading...</span></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4">
              <p className="text-xs text-secondary font-medium">Total Budget</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#4285F4' }}>{totalBudget ? `$${Number(totalBudget).toLocaleString()}` : 'N/A'}</p>
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4">
              <p className="text-xs text-secondary font-medium">Total Spent</p>
              <p className="text-2xl font-bold mt-1" style={{ color: overBudget ? '#EA4335' : '#34A853' }}>${Number(totalSpent).toLocaleString()}</p>
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4">
              <p className="text-xs text-secondary font-medium">Remaining</p>
              <p className="text-2xl font-bold mt-1" style={{ color: overBudget ? '#EA4335' : '#34A853' }}>
                {totalBudget ? `${overBudget ? '-' : ''}$${Math.abs(totalBudget - totalSpent).toLocaleString()}` : 'N/A'}
              </p>
            </div>
          </div>

          {overBudget && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: '#EA433515', color: '#EA4335' }}>
              <AlertCircle size={15} /> You're over budget by ${(totalSpent - totalBudget).toLocaleString()}
            </div>
          )}

          {categories.length > 0 && (
            <div className="bg-white border border-zinc-100 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-primary mb-4">Breakdown by Category</h2>
              <div className="flex flex-col gap-4">
                {categories.map(([cat, amount]) => {
                  const color = categoryColors[cat] || '#4285F4'
                  const Icon = categoryIcons[cat] || Ticket
                  const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
                  return (
                    <div key={cat} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}><Icon size={13} style={{ color }} /></div>
                          <span className="text-sm text-primary font-medium">{cat}</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color }}>${Number(amount).toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p className="text-xs text-secondary">{pct}% of total</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {dayPlans.length > 0 && (
            <div className="bg-white border border-zinc-100 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-primary mb-4">Per Day Breakdown</h2>
              <div className="flex flex-col gap-2">
                {dayPlans.map((day) => {
                  const dayTotal = day.expenses?.reduce((s, e) => s + parseFloat(e.amount || 0), 0) || 0
                  return (
                    <div key={day.id} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                      <span className="text-sm text-secondary">Day {day.dayNumber}</span>
                      <span className="text-sm font-semibold" style={{ color: '#34A853' }}>${dayTotal.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {categories.length === 0 && dayPlans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-3xl">💰</span>
              <p className="text-sm text-secondary">No budget data yet. Add expenses in the Itinerary View.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
