import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts'
import api from '../../utils/api'

const TABS = ['Manage Users', 'Popular Cities', 'Popular Activities', 'User Trends and Analytics']
const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']

function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`border rounded-lg px-4 py-2 text-sm whitespace-nowrap transition-colors ${
          value && value !== 'None' && value !== 'All' && value !== 'Default'
            ? 'border-primary bg-primary text-white'
            : 'border-zinc-200 bg-white text-primary hover:bg-zinc-50'
        }`}
      >
        {label}{value && value !== 'None' && value !== 'All' && value !== 'Default' ? `: ${value}` : ''}
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 min-w-[150px] py-1">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === opt ? 'bg-zinc-100 text-primary font-medium' : 'text-secondary hover:bg-zinc-50 hover:text-primary'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Manage Users')
  const [search, setSearch] = useState('')
  const [groupBy, setGroupBy] = useState('None')
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Default')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleTabChange = (tab) => { setActiveTab(tab); setGroupBy('None'); setFilter('All'); setSortBy('Default'); setSearch('') }

  const GROUP_BY_OPTIONS = {
    'Manage Users': ['None', 'Trips'],
    'Popular Cities': ['None', 'Country'],
    'Popular Activities': ['None', 'Category'],
    'User Trends and Analytics': ['None'],
  }
  const FILTER_OPTIONS = {
    'Manage Users': ['All', 'High Trips (>7)', 'Low Trips (≤7)'],
    'Popular Cities': ['All', 'Visits > 700', 'Visits ≤ 700'],
    'Popular Activities': ['All', ...([...new Set((data?.activities || []).map(a => a.category))].filter(Boolean))],
    'User Trends and Analytics': ['All'],
  }
  const SORT_OPTIONS = {
    'Manage Users': ['Default', 'Name A-Z', 'Name Z-A', 'Most Trips', 'Least Trips'],
    'Popular Cities': ['Default', 'Most Visits', 'Least Visits', 'Name A-Z'],
    'Popular Activities': ['Default', 'Most Done', 'Least Done', 'Name A-Z'],
    'User Trends and Analytics': ['Default'],
  }

  const stats = data ? [
    { label: 'Total Users', value: data.stats.totalUsers.toLocaleString(), color: 'text-blue-500' },
    { label: 'Active Trips', value: data.stats.activeTrips.toLocaleString(), color: 'text-green-500' },
    { label: 'Popular Cities', value: data.stats.totalCities.toLocaleString(), color: 'text-orange-500' },
    { label: 'Total Activities', value: data.stats.totalActivities.toLocaleString(), color: 'text-purple-500' },
  ] : []

  const renderContent = () => {
    if (loading) return <div className="flex justify-center py-10"><span className="text-sm text-secondary">Loading...</span></div>
    if (!data) return <div className="flex justify-center py-10"><span className="text-sm text-secondary">Failed to load data.</span></div>

    if (activeTab === 'Manage Users') {
      let users = (data.users || []).filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
      if (filter === 'High Trips (>7)') users = users.filter(u => Number(u.dataValues?.tripCount ?? u.tripCount) > 7)
      if (filter === 'Low Trips (≤7)') users = users.filter(u => Number(u.dataValues?.tripCount ?? u.tripCount) <= 7)
      if (sortBy === 'Name A-Z') users = [...users].sort((a, b) => a.name.localeCompare(b.name))
      if (sortBy === 'Name Z-A') users = [...users].sort((a, b) => b.name.localeCompare(a.name))
      if (sortBy === 'Most Trips') users = [...users].sort((a, b) => Number(b.tripCount ?? 0) - Number(a.tripCount ?? 0))
      if (sortBy === 'Least Trips') users = [...users].sort((a, b) => Number(a.tripCount ?? 0) - Number(b.tripCount ?? 0))

      const grouped = groupBy === 'Trips'
        ? { 'High Trips': users.filter(u => Number(u.tripCount ?? 0) > 7), 'Low Trips': users.filter(u => Number(u.tripCount ?? 0) <= 7) }
        : null

      const renderUser = (u, i) => {
        const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        const trips = Number(u.tripCount ?? 0)
        return (
          <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
            <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[i % 5]} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
              {u.avatar ? <img src={`http://localhost:5000${u.avatar}`} className="w-full h-full object-cover rounded-full" alt={u.name} /> : initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{u.name}</p>
              <p className="text-xs text-secondary truncate">{u.email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-primary">{trips} trips</p>
              <p className="text-xs text-secondary">{new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )
      }

      if (grouped) return (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).filter(([, items]) => items.length > 0).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2 px-1">{group}</p>
              <div className="flex flex-col gap-2">{items.map((u, i) => renderUser(u, i))}</div>
            </div>
          ))}
        </div>
      )
      return <div className="flex flex-col gap-3">{users.map((u, i) => renderUser(u, i))}</div>
    }

    if (activeTab === 'Popular Cities') {
      let cities = (data.cities || []).filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
      )
      const maxVisits = Math.max(...cities.map(c => Number(c.visits ?? 0)), 1)
      if (filter === 'Visits > 700') cities = cities.filter(c => Number(c.visits) > 700)
      if (filter === 'Visits ≤ 700') cities = cities.filter(c => Number(c.visits) <= 700)
      if (sortBy === 'Most Visits') cities = [...cities].sort((a, b) => Number(b.visits) - Number(a.visits))
      if (sortBy === 'Least Visits') cities = [...cities].sort((a, b) => Number(a.visits) - Number(b.visits))
      if (sortBy === 'Name A-Z') cities = [...cities].sort((a, b) => a.name.localeCompare(b.name))

      const grouped = groupBy === 'Country' ? cities.reduce((acc, c) => { (acc[c.country] = acc[c.country] || []).push(c); return acc }, {}) : null

      const renderCity = (c) => (
        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
          <span className="text-2xl">🌍</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{c.name}</p>
            <p className="text-xs text-secondary">{c.country}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{Number(c.visits).toLocaleString()}</p>
            <p className="text-xs text-secondary">visits</p>
          </div>
          <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(Number(c.visits) / maxVisits) * 100}%` }} />
          </div>
        </div>
      )

      if (grouped) return (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2 px-1">{group}</p>
              <div className="flex flex-col gap-2">{items.map(renderCity)}</div>
            </div>
          ))}
        </div>
      )
      return <div className="flex flex-col gap-3">{cities.map(renderCity)}</div>
    }

    if (activeTab === 'Popular Activities') {
      let activities = (data.activities || []).filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.category || '').toLowerCase().includes(search.toLowerCase())
      )
      if (filter !== 'All') activities = activities.filter(a => a.category === filter)
      if (sortBy === 'Most Done') activities = [...activities].sort((a, b) => Number(b.count) - Number(a.count))
      if (sortBy === 'Least Done') activities = [...activities].sort((a, b) => Number(a.count) - Number(b.count))
      if (sortBy === 'Name A-Z') activities = [...activities].sort((a, b) => a.name.localeCompare(b.name))

      const grouped = groupBy === 'Category' ? activities.reduce((acc, a) => { (acc[a.category] = acc[a.category] || []).push(a); return acc }, {}) : null

      const renderActivity = (a) => (
        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
          <span className="text-2xl">🎯</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{a.name}</p>
            <span className="text-xs px-2 py-0.5 bg-zinc-100 text-secondary rounded-full">{a.category}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{Number(a.count).toLocaleString()}</p>
            <p className="text-xs text-secondary">times done</p>
          </div>
        </div>
      )

      if (grouped) return (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2 px-1">{group}</p>
              <div className="flex flex-col gap-2">{items.map(renderActivity)}</div>
            </div>
          ))}
        </div>
      )
      return <div className="flex flex-col gap-3">{activities.map(renderActivity)}</div>
    }

    if (activeTab === 'User Trends and Analytics') {
      const barData = (data.cities || []).slice(0, 5).map(c => ({ x: c.name, v: Number(c.visits) }))
      return (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium text-secondary mb-2">Users & Trips Growth</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#4ab3d4" strokeWidth={2} dot={{ r: 4 }} name="Users" />
                <Line type="monotone" dataKey="trips" stroke="#e05c5c" strokeWidth={2} dot={{ r: 4 }} name="Trips" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary mb-2">Top Cities by Visits</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={barData} barSize={32}>
                <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="v" radius={[4, 4, 0, 0]} fill="#f0a04b" name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary tracking-tight">Dashboard</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-zinc-100 rounded-xl px-4 py-3 animate-pulse h-20" />
            ))
          ) : (
            stats.map(s => (
              <div key={s.label} className="bg-white border border-zinc-100 rounded-xl px-4 py-3">
                <p className="text-xs text-secondary">{s.label}</p>
                <p className={`text-2xl font-semibold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-primary placeholder:text-zinc-400 outline-none focus:border-zinc-400 bg-white" />
          <Dropdown label="Group by" options={GROUP_BY_OPTIONS[activeTab]} value={groupBy} onChange={setGroupBy} />
          <Dropdown label="Filter" options={FILTER_OPTIONS[activeTab]} value={filter} onChange={setFilter} />
          <Dropdown label="Sort by" options={SORT_OPTIONS[activeTab]} value={sortBy} onChange={setSortBy} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => handleTabChange(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${activeTab === tab ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-zinc-200 hover:bg-zinc-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
