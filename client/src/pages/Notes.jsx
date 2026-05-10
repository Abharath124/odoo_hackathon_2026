import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, Plus, Trash2, Pencil, ChevronDown, StickyNote } from 'lucide-react'
import api from '../utils/api'

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  body: z.string().min(5, 'Note must be at least 5 characters'),
  day: z.string().optional(),
})

const tabs = ['All', 'by Day']

export default function Notes() {
  const [trips, setTrips] = useState([])
  const [selectedTripId, setSelectedTripId] = useState('')
  const [notes, setNotes] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '', day: '' },
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
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (activeTab === 'by Day') params.set('view', 'day')
    api.get(`/notes/${selectedTripId}?${params}`).then((r) => setNotes(r.data.notes || [])).catch(() => {}).finally(() => setLoading(false))
  }, [selectedTripId, search, activeTab])

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        const { data: res } = await api.put(`/notes/${selectedTripId}/${editingId}`, { title: data.title, noteText: data.body, dayNumber: data.day || null })
        setNotes((prev) => prev.map((n) => n.id === editingId ? res.note : n))
        setEditingId(null)
      } else {
        const { data: res } = await api.post(`/notes/${selectedTripId}`, { title: data.title, noteText: data.body, dayNumber: data.day || null })
        setNotes((prev) => [res.note, ...prev])
      }
      reset()
      setShowForm(false)
    } catch (_) {}
  }

  const startEdit = (note) => {
    setEditingId(note.id)
    setValue('title', note.title || '')
    setValue('body', note.noteText || '')
    setValue('day', note.dayNumber || '')
    setShowForm(true)
  }

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${selectedTripId}/${id}`)
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (_) {}
  }

  const cancelForm = () => { reset(); setShowForm(false); setEditingId(null) }

  const inputCls = (err) =>
    `w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${err ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-blue-200'}`

  return (
    <div className="flex flex-col gap-4 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><LayoutGrid size={13} /> Group by</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><SlidersHorizontal size={13} /> Filter</button>
        <button className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-secondary transition-colors"><ArrowUpDown size={13} /> Sort by...</button>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-primary">Trip Notes</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className="w-full appearance-none border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all pr-8">
              {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
          </div>
          <button onClick={() => { setEditingId(null); reset(); setShowForm((v) => !v) }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all shrink-0" style={{ background: '#4285F4' }}>
            <Plus size={14} /> Add Note
          </button>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all" style={activeTab === tab ? { background: '#4285F4', color: '#fff' } : { background: '#fff', color: '#5F6368', border: '1px solid #e4e4e7' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-3">
          <div>
            <input {...register('title')} placeholder="Note title *" className={inputCls(errors.title)} />
            {errors.title && <p className="text-xs text-red-400 mt-0.5">{errors.title.message}</p>}
          </div>
          <div>
            <textarea {...register('body')} placeholder="Write your note..." rows={3} className={`${inputCls(errors.body)} resize-none`} />
            {errors.body && <p className="text-xs text-red-400 mt-0.5">{errors.body.message}</p>}
          </div>
          <input {...register('day')} placeholder="Day number (e.g. 3)" className={inputCls(false)} />
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all disabled:opacity-50" style={{ background: '#4285F4' }}>
              {editingId ? 'Update Note' : 'Save Note'}
            </button>
            <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg text-sm font-medium text-secondary border border-zinc-200 hover:bg-zinc-50 transition-all">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><span className="text-sm text-secondary">Loading...</span></div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <StickyNote size={32} className="text-zinc-300" />
          <p className="text-sm text-secondary">{selectedTripId ? 'No notes yet. Add your first note!' : 'Select a trip to view notes.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white border border-zinc-100 rounded-xl px-5 py-4 flex flex-col gap-2 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{note.title}</p>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">{note.noteText}</p>
                  {note.dayNumber && <p className="text-xs text-zinc-400 mt-1">Day {note.dayNumber}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(note)} className="p-1.5 rounded-lg text-secondary hover:text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
