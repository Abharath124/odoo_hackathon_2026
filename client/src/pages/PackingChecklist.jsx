import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Plus, RotateCcw, Share2, X } from 'lucide-react'

const addSchema = z.object({ item: z.string().min(2, 'Item must be at least 2 characters') })

const initialCategories = [
  {
    id: 'documents', label: 'Documents',
    items: [
      { id: 1, label: 'Passport', checked: true },
      { id: 2, label: 'Flight Tickets (printed)', checked: true },
      { id: 3, label: 'Travel Insurance', checked: false },
      { id: 4, label: 'Hotel booking confirmation', checked: false },
    ],
  },
  {
    id: 'clothing', label: 'Clothing',
    items: [
      { id: 1, label: 'Casual Shirts', checked: true },
      { id: 2, label: 'Trousers / Jeans', checked: false },
      { id: 3, label: 'Comfortable walking shoes', checked: false },
      { id: 4, label: 'Light jacket / windbreaker', checked: false },
    ],
  },
  {
    id: 'electronics', label: 'Electronics',
    items: [
      { id: 1, label: 'Phone charger', checked: true },
      { id: 2, label: 'Universal power adapter', checked: false },
      { id: 3, label: 'Earphones / headphones', checked: false },
    ],
  },
]

const trips = ['Trip: Paris & Rome Adventure', 'Trip: Asia Adventure', 'Trip: Beach Getaway']

export default function PackingChecklist() {
  const [categories, setCategories] = useState(initialCategories)
  const [selectedTrip, setSelectedTrip] = useState(trips[0])
  const [search, setSearch] = useState('')
  const [addingTo, setAddingTo] = useState(null)
  const [shared, setShared] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addSchema),
    defaultValues: { item: '' },
  })

  const totalItems = categories.flatMap((c) => c.items).length
  const packedItems = categories.flatMap((c) => c.items).filter((i) => i.checked).length

  const toggleItem = (catId, itemId) =>
    setCategories((prev) => prev.map((c) =>
      c.id === catId
        ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, checked: !i.checked } : i) }
        : c
    ))

  const removeItem = (catId, itemId) =>
    setCategories((prev) => prev.map((c) =>
      c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
    ))

  const onAddItem = ({ item }) => {
    if (!addingTo) return
    setCategories((prev) => prev.map((c) =>
      c.id === addingTo
        ? { ...c, items: [...c.items, { id: Date.now(), label: item, checked: false }] }
        : c
    ))
    reset()
    setAddingTo(null)
  }

  const resetAll = () =>
    setCategories((prev) => prev.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i, checked: false })) })))

  const handleShare = () => { setShared(true); setTimeout(() => setShared(false), 2000) }

  const progressPct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0

  const filteredCategories = categories.map((c) => ({
    ...c,
    items: c.items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())),
  })).filter((c) => c.items.length > 0 || !search)

  return (
    <div className="flex flex-col gap-5 pb-10 max-w-2xl mx-auto">

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

      {/* Packing checklist header */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-primary">Packing checklist</h2>

        {/* Trip selector */}
        <select
          value={selectedTrip}
          onChange={(e) => setSelectedTrip(e.target.value)}
          className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all"
        >
          {trips.map((t) => <option key={t}>{t}</option>)}
        </select>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Progress: {packedItems}/{totalItems} items packed</span>
            <span className="font-semibold" style={{ color: progressPct === 100 ? '#34A853' : '#4285F4' }}>{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: progressPct === 100 ? '#34A853' : '#4285F4' }}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        {filteredCategories.map((cat) => {
          const catPacked = cat.items.filter((i) => i.checked).length
          return (
            <div key={cat.id} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-50">
                <span className="text-sm font-semibold text-primary">{cat.label}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#4285F418', color: '#4285F4' }}>
                  {catPacked}/{cat.items.length}
                </span>
              </div>

              {/* Items */}
              <div className="px-5 py-3 flex flex-col gap-2">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(cat.id, item.id)}
                      className="w-4 h-4 rounded accent-blue-500 cursor-pointer shrink-0"
                    />
                    <span className={`text-sm flex-1 transition-all ${item.checked ? 'line-through text-zinc-400' : 'text-primary'}`}>
                      {item.label}
                    </span>
                    <button
                      onClick={() => removeItem(cat.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-secondary hover:text-red-500 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Add item inline form */}
                {addingTo === cat.id ? (
                  <form onSubmit={handleSubmit(onAddItem)} className="flex items-center gap-2 mt-1">
                    <input
                      {...register('item')}
                      autoFocus
                      placeholder="Item name..."
                      className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.item ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'
                      }`}
                    />
                    <button type="submit" className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-all" style={{ background: '#4285F4' }}>Add</button>
                    <button type="button" onClick={() => { setAddingTo(null); reset() }} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-secondary hover:bg-zinc-50 transition-all">Cancel</button>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingTo(cat.id)}
                    className="flex items-center gap-1.5 text-xs font-medium mt-1 self-start px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    style={{ color: '#4285F4' }}
                  >
                    <Plus size={12} /> add item to checklist
                  </button>
                )}
                {errors.item && addingTo === cat.id && <p className="text-xs text-red-400">{errors.item.message}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAddingTo(categories[0].id)}
          className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-medium text-secondary hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
        >
          <Plus size={14} /> add item to checklist
        </button>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all"
        >
          <RotateCcw size={14} /> Reset all
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all"
          style={{ background: shared ? '#34A853' : '#4285F4' }}
        >
          <Share2 size={14} /> {shared ? 'Shared!' : 'Share Checklist'}
        </button>
      </div>

    </div>
  )
}
