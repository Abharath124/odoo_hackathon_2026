import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, ArrowDown, Plus, Trash2 } from 'lucide-react'
import api from '../utils/api'

export default function ItineraryView() {
  const [itineraries, setItineraries] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [dayPlans, setDayPlans] = useState([])
  const [totalExpense, setTotalExpense] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

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
    const params = search ? `?search=${search}` : ''
    api.get(`/budget/${selectedId}${params}`).then((r) => {
      setDayPlans(r.data.dayPlans || [])
      setTotalExpense(r.data.totalBudget || 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [selectedId, search])

  const addDay = async () => {
    if (!selectedId) return
    const dayNumber = dayPlans.length + 1
    try {
      const { data } = await api.post(`/budget/${selectedId}/days`, { dayNumber, title: `Day ${dayNumber}` })
      setDayPlans((prev) => [...prev, { ...data.dayPlan, expenses: [] }])
    } catch (_) {}
  }

  const addActivity = async (dayId) => {
    try {
      const { data } = await api.post(`/budget/${selectedId}/days/${dayId}/expenses`, { activity: '', amount: 0, category: 'General' })
      setDayPlans((prev) => prev.map((d) => d.id === dayId ? { ...d, expenses: [...d.expenses, data.expense] } : d))
    } catch (_) {}
  }

  const updateActivity = async (dayId, expId, key, value) => {
    setDayPlans((prev) => prev.map((d) => d.id === dayId ? { ...d, expenses: d.expenses.map((e) => e.id === expId ? { ...e, [key]: value } : e) } : d))
    try {
      const day = dayPlans.find((d) => d.id === dayId)
      const exp = day?.expenses.find((e) => e.id === expId)
      if (exp) await api.put(`/budget/${selectedId}/days/${dayId}/expenses/${expId}`, { ...exp, [key]: value })
    } catch (_) {}
  }

  const removeActivity = async (dayId, expId) => {
    try {
      await api.delete(`/budget/${selectedId}/days/${dayId}/expenses/${expId}`)
      setDayPlans((prev) => prev.map((d) => d.id === dayId ? { ...d, expenses: d.expenses.filter((e) => e.id !== expId) } : d))
    } catch (_) {}
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><LayoutGrid size={13} /> Group by</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><SlidersHorizontal size={13} /> Filter</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><ArrowUpDown size={13} /> Sort by...</button>
      </div>

      {itineraries.length > 0 && (
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all">
          {itineraries.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
      )}

      <div className="text-center">
        <h1 className="text-lg font-bold text-primary">Itinerary View</h1>
        {selectedId && itineraries.find((i) => String(i.id) === selectedId) && (
          <p className="text-sm text-secondary mt-0.5">{itineraries.find((i) => String(i.id) === selectedId)?.title}</p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><span className="text-sm text-secondary">Loading...</span></div>
      ) : (
        <>
          <div className="flex items-center gap-3 px-1">
            <div className="w-16 shrink-0" />
            <div className="flex-1 text-xs font-semibold text-secondary text-center">Activity</div>
            <div className="w-28 text-xs font-semibold text-secondary text-center">Expense</div>
          </div>

          <div className="flex flex-col gap-6">
            {dayPlans.map((day) => (
              <div key={day.id} className="flex gap-3 items-start">
                <div className="w-16 shrink-0 text-xs font-semibold px-2 py-1.5 rounded-lg text-center mt-1" style={{ background: '#4285F418', color: '#4285F4', border: '1px solid #4285F430' }}>
                  Day {day.dayNumber}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {day.expenses.map((act, idx) => (
                    <div key={act.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <input value={act.activity || ''} onChange={(e) => updateActivity(day.id, act.id, 'activity', e.target.value)} placeholder="Activity..." className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
                        <input value={act.amount || ''} onChange={(e) => updateActivity(day.id, act.id, 'amount', e.target.value)} placeholder="$0" type="number" className="w-28 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
                        <button onClick={() => removeActivity(day.id, act.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                      </div>
                      {idx < day.expenses.length - 1 && <div className="flex justify-center"><ArrowDown size={14} className="text-zinc-300" /></div>}
                    </div>
                  ))}
                  <button onClick={() => addActivity(day.id)} className="flex items-center gap-1.5 text-xs font-medium mt-1 self-start px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors" style={{ color: '#4285F4' }}>
                    <Plus size={12} /> Add activity
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addDay} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-medium text-secondary hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
            <Plus size={15} /> Add Day
          </button>

          <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">Total Estimated Expense</span>
            <span className="text-lg font-bold" style={{ color: '#4285F4' }}>${Number(totalExpense).toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  )
}
