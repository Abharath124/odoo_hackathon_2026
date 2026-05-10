import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, ArrowDown, Plus, Trash2 } from 'lucide-react'

const schema = z.object({ query: z.string().min(1, 'Enter a place to search') })

const initialDays = [
  {
    id: 1, label: 'Day 1',
    activities: [
      { id: 1, activity: 'Hotel Check-in', expense: '120' },
      { id: 2, activity: 'City Walking Tour', expense: '25' },
      { id: 3, activity: 'Dinner at Local Restaurant', expense: '40' },
    ],
  },
  {
    id: 2, label: 'Day 2',
    activities: [
      { id: 1, activity: 'Museum Visit', expense: '18' },
      { id: 2, activity: 'Boat Ride', expense: '35' },
      { id: 3, activity: 'Shopping', expense: '80' },
    ],
  },
]

export default function ItineraryView() {
  const [days, setDays] = useState(initialDays)
  const [place, setPlace] = useState('Paris, France')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { query: '' },
  })

  const onSearch = ({ query }) => setPlace(query)

  const updateActivity = (dayId, actId, key, value) =>
    setDays((prev) => prev.map((d) =>
      d.id === dayId
        ? { ...d, activities: d.activities.map((a) => a.id === actId ? { ...a, [key]: value } : a) }
        : d
    ))

  const addActivity = (dayId) =>
    setDays((prev) => prev.map((d) =>
      d.id === dayId
        ? { ...d, activities: [...d.activities, { id: Date.now(), activity: '', expense: '' }] }
        : d
    ))

  const removeActivity = (dayId, actId) =>
    setDays((prev) => prev.map((d) =>
      d.id === dayId
        ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
        : d
    ))

  const addDay = () =>
    setDays((prev) => [...prev, { id: Date.now(), label: `Day ${prev.length + 1}`, activities: [{ id: Date.now(), activity: '', expense: '' }] }])

  const totalExpense = days.flatMap((d) => d.activities).reduce((s, a) => s + (parseFloat(a.expense) || 0), 0)

  return (
    <div className="flex flex-col gap-5 pb-10">

      {/* Search bar */}
      <form onSubmit={handleSubmit(onSearch)} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              {...register('query')}
              placeholder="Search bar ..."
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

      {/* Title */}
      <div className="text-center">
        <h1 className="text-lg font-bold text-primary">Itenary for a selected place</h1>
        {place && <p className="text-sm text-secondary mt-0.5">{place}</p>}
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-16 shrink-0" />
        <div className="flex-1 text-xs font-semibold text-secondary text-center">Physical activity</div>
        <div className="w-28 text-xs font-semibold text-secondary text-center">Expense</div>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-6">
        {days.map((day) => (
          <div key={day.id} className="flex gap-3 items-start">

            {/* Day label */}
            <div
              className="w-16 shrink-0 text-xs font-semibold px-2 py-1.5 rounded-lg text-center mt-1"
              style={{ background: '#4285F418', color: '#4285F4', border: '1px solid #4285F430' }}
            >
              {day.label}
            </div>

            {/* Activities */}
            <div className="flex-1 flex flex-col gap-2">
              {day.activities.map((act, idx) => (
                <div key={act.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      value={act.activity}
                      onChange={(e) => updateActivity(day.id, act.id, 'activity', e.target.value)}
                      placeholder="Physical activity..."
                      className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
                    />
                    <input
                      value={act.expense}
                      onChange={(e) => updateActivity(day.id, act.id, 'expense', e.target.value)}
                      placeholder="$0"
                      type="number"
                      className="w-28 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-primary bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={() => removeActivity(day.id, act.id)}
                      className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Arrow between activities */}
                  {idx < day.activities.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowDown size={14} className="text-zinc-300" />
                    </div>
                  )}
                </div>
              ))}

              {/* Add activity */}
              <button
                onClick={() => addActivity(day.id)}
                className="flex items-center gap-1.5 text-xs font-medium mt-1 self-start px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                style={{ color: '#4285F4' }}
              >
                <Plus size={12} /> Add activity
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Day */}
      <button
        onClick={addDay}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-medium text-secondary hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
      >
        <Plus size={15} /> Add Day
      </button>

      {/* Budget summary */}
      <div className="bg-white border border-zinc-100 rounded-2xl px-5 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Total Estimated Expense</span>
        <span className="text-lg font-bold" style={{ color: '#4285F4' }}>${totalExpense.toFixed(2)}</span>
      </div>

    </div>
  )
}
