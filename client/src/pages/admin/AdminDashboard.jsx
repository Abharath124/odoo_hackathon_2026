import { useState, useRef, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts'

const TABS = ['Manage Users', 'Popular Cities', 'Popular Activities', 'User Trends and Analytics']

const STATS = [
  { label: 'Total Users', value: '2,847', change: '+124 this week', color: 'text-blue-500' },
  { label: 'Active Trips', value: '1,293', change: '+38 today', color: 'text-green-500' },
  { label: 'Popular Cities', value: '186', change: '+5 new', color: 'text-orange-500' },
  { label: 'Total Activities', value: '4,512', change: '+210 this month', color: 'text-purple-500' },
]

const USERS = [
  { name: 'Aarav Sharma', email: 'aarav@gmail.com', city: 'Mumbai', trips: 8, avatar: 'AS' },
  { name: 'Priya Nair', email: 'priya@gmail.com', city: 'Bangalore', trips: 5, avatar: 'PN' },
  { name: 'Rohan Mehta', email: 'rohan@gmail.com', city: 'Delhi', trips: 12, avatar: 'RM' },
  { name: 'Sneha Iyer', email: 'sneha@gmail.com', city: 'Chennai', trips: 3, avatar: 'SI' },
  { name: 'Karan Patel', email: 'karan@gmail.com', city: 'Ahmedabad', trips: 7, avatar: 'KP' },
]

const CITIES = [
  { name: 'Paris', country: 'France', visits: 842, flag: '🇫🇷' },
  { name: 'Bali', country: 'Indonesia', visits: 731, flag: '🇮🇩' },
  { name: 'Tokyo', country: 'Japan', visits: 698, flag: '🇯🇵' },
  { name: 'New York', country: 'USA', visits: 654, flag: '🇺🇸' },
  { name: 'Rome', country: 'Italy', visits: 589, flag: '🇮🇹' },
]

const ACTIVITIES = [
  { name: 'Hiking', category: 'Adventure', count: 1240, icon: '🥾' },
  { name: 'Museum Visit', category: 'Culture', count: 980, icon: '🏛️' },
  { name: 'Beach Day', category: 'Leisure', count: 870, icon: '🏖️' },
  { name: 'Food Tour', category: 'Culinary', count: 760, icon: '🍜' },
  { name: 'City Walk', category: 'Sightseeing', count: 650, icon: '🚶' },
]

const pieData = [
  { name: 'Adventure', value: 35 },
  { name: 'Culture', value: 28 },
  { name: 'Leisure', value: 22 },
  { name: 'Culinary', value: 15 },
]
const PIE_COLORS = ['#4ab3d4', '#e05c5c', '#5cb85c', '#f0a04b']

const lineData = [
  { x: 'Jan', users: 320, trips: 180 },
  { x: 'Feb', users: 480, trips: 260 },
  { x: 'Mar', users: 410, trips: 310 },
  { x: 'Apr', users: 620, trips: 420 },
  { x: 'May', users: 580, trips: 390 },
  { x: 'Jun', users: 750, trips: 510 },
  { x: 'Jul', users: 820, trips: 590 },
]

const barData = [
  { x: 'Paris', v: 842 },
  { x: 'Bali', v: 731 },
  { x: 'Tokyo', v: 698 },
  { x: 'NY', v: 654 },
  { x: 'Rome', v: 589 },
]

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']

const GROUP_BY_OPTIONS = {
  'Manage Users':      ['None', 'City', 'Trips'],
  'Popular Cities':    ['None', 'Country', 'Visits'],
  'Popular Activities':['None', 'Category', 'Count'],
  'User Trends and Analytics': ['None'],
}

const FILTER_OPTIONS = {
  'Manage Users':      ['All', 'High Trips (>7)', 'Low Trips (≤7)'],
  'Popular Cities':    ['All', 'Visits > 700', 'Visits ≤ 700'],
  'Popular Activities':['All', 'Adventure', 'Culture', 'Leisure', 'Culinary', 'Sightseeing'],
  'User Trends and Analytics': ['All'],
}

const SORT_OPTIONS = {
  'Manage Users':      ['Default', 'Name A-Z', 'Name Z-A', 'Most Trips', 'Least Trips'],
  'Popular Cities':    ['Default', 'Most Visits', 'Least Visits', 'Name A-Z'],
  'Popular Activities':['Default', 'Most Done', 'Least Done', 'Name A-Z'],
  'User Trends and Analytics': ['Default'],
}

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
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === opt ? 'bg-zinc-100 text-primary font-medium' : 'text-secondary hover:bg-zinc-50 hover:text-primary'
              }`}
            >
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
  // reset controls on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setGroupBy('None')
    setFilter('All')
    setSortBy('Default')
    setSearch('')
  }

  const renderContent = () => {
    if (activeTab === 'Manage Users') {
      let data = USERS.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.city.toLowerCase().includes(search.toLowerCase())
      )
      if (filter === 'High Trips (>7)') data = data.filter(u => u.trips > 7)
      if (filter === 'Low Trips (≤7)') data = data.filter(u => u.trips <= 7)
      if (sortBy === 'Name A-Z') data = [...data].sort((a, b) => a.name.localeCompare(b.name))
      if (sortBy === 'Name Z-A') data = [...data].sort((a, b) => b.name.localeCompare(a.name))
      if (sortBy === 'Most Trips') data = [...data].sort((a, b) => b.trips - a.trips)
      if (sortBy === 'Least Trips') data = [...data].sort((a, b) => a.trips - b.trips)

      const grouped = groupBy === 'City'
        ? Object.groupBy(data, u => u.city)
        : groupBy === 'Trips'
        ? Object.groupBy(data, u => u.trips > 7 ? 'High Trips' : 'Low Trips')
        : null

      const renderUser = (u, i) => (
        <div key={u.email} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
          <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[i % 5]} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>{u.avatar}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">{u.name}</p>
            <p className="text-xs text-secondary truncate">{u.email}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-secondary">{u.city}</p>
            <p className="text-xs font-medium text-primary">{u.trips} trips</p>
          </div>
        </div>
      )

      if (grouped) return (
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2 px-1">{group}</p>
              <div className="flex flex-col gap-2">{items.map((u, i) => renderUser(u, i))}</div>
            </div>
          ))}
        </div>
      )
      return <div className="flex flex-col gap-3">{data.map((u, i) => renderUser(u, i))}</div>
    }

    if (activeTab === 'Popular Cities') {
      let data = CITIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
      )
      if (filter === 'Visits > 700') data = data.filter(c => c.visits > 700)
      if (filter === 'Visits ≤ 700') data = data.filter(c => c.visits <= 700)
      if (sortBy === 'Most Visits') data = [...data].sort((a, b) => b.visits - a.visits)
      if (sortBy === 'Least Visits') data = [...data].sort((a, b) => a.visits - b.visits)
      if (sortBy === 'Name A-Z') data = [...data].sort((a, b) => a.name.localeCompare(b.name))

      const grouped = groupBy === 'Country'
        ? Object.groupBy(data, c => c.country)
        : groupBy === 'Visits'
        ? Object.groupBy(data, c => c.visits > 700 ? 'High Visits' : 'Lower Visits')
        : null

      const renderCity = (c) => (
        <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
          <span className="text-2xl">{c.flag}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{c.name}</p>
            <p className="text-xs text-secondary">{c.country}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{c.visits.toLocaleString()}</p>
            <p className="text-xs text-secondary">visits</p>
          </div>
          <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(c.visits / 842) * 100}%` }} />
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
      return <div className="flex flex-col gap-3">{data.map(renderCity)}</div>
    }

    if (activeTab === 'Popular Activities') {
      let data = ACTIVITIES.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
      )
      const filterCats = ['Adventure','Culture','Leisure','Culinary','Sightseeing']
      if (filterCats.includes(filter)) data = data.filter(a => a.category === filter)
      if (sortBy === 'Most Done') data = [...data].sort((a, b) => b.count - a.count)
      if (sortBy === 'Least Done') data = [...data].sort((a, b) => a.count - b.count)
      if (sortBy === 'Name A-Z') data = [...data].sort((a, b) => a.name.localeCompare(b.name))

      const grouped = groupBy === 'Category'
        ? Object.groupBy(data, a => a.category)
        : groupBy === 'Count'
        ? Object.groupBy(data, a => a.count > 900 ? 'Popular' : 'Regular')
        : null

      const renderActivity = (a) => (
        <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-colors">
          <span className="text-2xl">{a.icon}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{a.name}</p>
            <span className="text-xs px-2 py-0.5 bg-zinc-100 text-secondary rounded-full">{a.category}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{a.count.toLocaleString()}</p>
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
      return <div className="flex flex-col gap-3">{data.map(renderActivity)}</div>
    }

    if (activeTab === 'User Trends and Analytics') return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-medium text-secondary mb-2">Users & Trips Growth (2025)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={lineData}>
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

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary tracking-tight">Traveloop</span>
          <div className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-xs text-secondary cursor-pointer hover:bg-zinc-50">⊙</div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="bg-white border border-zinc-100 rounded-xl px-4 py-3">
              <p className="text-xs text-secondary">{s.label}</p>
              <p className={`text-2xl font-semibold mt-0.5 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-secondary mt-1">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Search + Controls */}
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bar ......"
            className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-primary placeholder:text-zinc-400 outline-none focus:border-zinc-400 bg-white"
          />
          <Dropdown label="Group by" options={GROUP_BY_OPTIONS[activeTab]} value={groupBy} onChange={setGroupBy} />
          <Dropdown label="Filter" options={FILTER_OPTIONS[activeTab]} value={filter} onChange={setFilter} />
          <Dropdown label="Sort by" options={SORT_OPTIONS[activeTab]} value={sortBy} onChange={setSortBy} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-primary border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
