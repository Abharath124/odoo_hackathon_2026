import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Plus, RotateCcw, Share2, X } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import api from '../utils/api'

const addSchema = z.object({ item: z.string().min(2, 'Item must be at least 2 characters') })

export default function PackingChecklist() {
  const [trips, setTrips] = useState([])
  const [selectedTripId, setSelectedTripId] = useState('')
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [addingTo, setAddingTo] = useState(null)
  const [shared, setShared] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(addSchema),
    defaultValues: { item: '' },
  })

  useEffect(() => {
    api.get('/trips').then((r) => {
      const list = r.data.trips || []
      setTrips(list)
      if (list.length) setSelectedTripId(String(list[0].id))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedTripId) return
    setLoading(true)
    api.get(`/checklist/${selectedTripId}`).then((r) => setItems(r.data.items || [])).catch(() => {}).finally(() => setLoading(false))
  }, [selectedTripId])

  const toggleItem = async (itemId) => {
    try {
      const { data } = await api.patch(`/checklist/${selectedTripId}/${itemId}/toggle`)
      setItems((prev) => prev.map((i) => i.id === itemId ? data.item : i))
    } catch (err) {
      console.error('Toggle error:', err)
      alert('Failed to toggle item')
    }
  }

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/checklist/${selectedTripId}/${itemId}`)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete item')
    }
  }

  const onAddItem = async ({ item }) => {
    if (!addingTo) return
    try {
      const { data } = await api.post(`/checklist/${selectedTripId}`, { itemName: item, category: addingTo })
      setItems((prev) => [...prev, data.item])
      reset()
      setAddingTo(null)
    } catch (err) {
      console.error('Add item error:', err)
      alert('Failed to add item: ' + (err.response?.data?.message || err.message))
    }
  }

  const resetAll = async () => {
    try {
      await api.post(`/checklist/${selectedTripId}/reset`)
      setItems((prev) => prev.map((i) => ({ ...i, isPacked: false })))
    } catch (err) {
      console.error('Reset error:', err)
      alert('Failed to reset checklist')
    }
  }

  const handleShare = () => { setShared(true); setTimeout(() => setShared(false), 2000) }

  // group by category
  const filtered = items.filter((i) => i.itemName?.toLowerCase().includes(search.toLowerCase()))
  const categories = [...new Set(filtered.map((i) => i.category || 'General'))]
  const totalItems = items.length
  const packedItems = items.filter((i) => i.isPacked).length
  const progressPct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0

  return (
    <div className="flex flex-col gap-5 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><LayoutGrid size={13} /> Group by</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><SlidersHorizontal size={13} /> Filter</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><ArrowUpDown size={13} /> Sort by...</button>
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-primary">Packing Checklist</h2>
        <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className="w-full border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm text-primary bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all">
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Progress: {packedItems}/{totalItems} items packed</span>
            <span className="font-semibold" style={{ color: progressPct === 100 ? '#34A853' : '#4285F4' }}>{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: progressPct === 100 ? '#34A853' : '#4285F4' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><span className="text-sm text-secondary">Loading...</span></div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const catItems = filtered.filter((i) => (i.category || 'General') === cat)
            const catPacked = catItems.filter((i) => i.isPacked).length
            return (
              <div key={cat} className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-50">
                  <span className="text-sm font-semibold text-primary">{cat}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#4285F418', color: '#4285F4' }}>{catPacked}/{catItems.length}</span>
                </div>
                <div className="px-5 py-3 flex flex-col gap-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 group">
                      <input type="checkbox" checked={!!item.isPacked} onChange={() => toggleItem(item.id)} className="w-4 h-4 rounded accent-blue-500 cursor-pointer shrink-0" />
                      <span className={`text-sm flex-1 transition-all ${item.isPacked ? 'line-through text-zinc-400' : 'text-primary'}`}>{item.itemName}</span>
                      <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-secondary hover:text-red-500 transition-all"><X size={12} /></button>
                    </div>
                  ))}
                  {addingTo === cat ? (
                    <form onSubmit={handleSubmit(onAddItem)} className="flex items-center gap-2 mt-1">
                      <Input
                        id="item"
                        placeholder="Item name..."
                        autoFocus
                        error={errors.item?.message}
                        {...register('item')}
                      />
                      <Button type="submit" className="!w-auto px-3 text-xs">
                        Add
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setAddingTo(null); reset() }} className="!w-auto px-3 text-xs">
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <button onClick={() => setAddingTo(cat)} className="flex items-center gap-1.5 text-xs font-medium mt-1 self-start px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors" style={{ color: '#4285F4' }}>
                      <Plus size={12} /> add item
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {categories.length === 0 && !addingTo && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-3xl">🧳</span>
              <p className="text-sm text-secondary">No items yet. Add your first item!</p>
            </div>
          )}

          {categories.length === 0 && addingTo && (
            <div className="bg-white border border-zinc-100 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-primary mb-3">Add Item to {addingTo}</h3>
              <form onSubmit={handleSubmit(onAddItem)} className="flex items-center gap-2">
                <Input
                  id="item"
                  placeholder="Item name..."
                  autoFocus
                  error={errors.item?.message}
                  {...register('item')}
                />
                <Button type="submit" className="!w-auto px-4">
                  Add
                </Button>
                <Button type="button" variant="outline" onClick={() => { setAddingTo(null); reset() }} className="!w-auto px-4">
                  Cancel
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => setAddingTo('General')} className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-medium text-secondary hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
          <Plus size={14} /> Add item
        </button>
        <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-secondary hover:bg-zinc-50 transition-all">
          <RotateCcw size={14} /> Reset all
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:opacity-90 transition-all">
          <Share2 size={14} /> {shared ? 'Shared!' : 'Share'}
        </button>
      </div>
    </div>
  )
}
