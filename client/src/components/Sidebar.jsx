import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import api from '../utils/api'

const navItems = [
  { label: 'Dashboard', path: '/home' },
  { label: 'My Trips', path: '/trips' },
  { label: 'Itinerary', path: '/itinerary' },
  { label: 'Budget', path: '/budget' },
  { label: 'Packing Checklist', path: '/packing' },
  { label: 'Notes', path: '/notes' },
  { label: 'Activities', path: '/activities' },
  { label: 'Community', path: '/community' },
  { label: 'Expense & Invoice', path: '/invoice' },
  { label: 'Profile', path: '/profile' },
]

export default function Sidebar({ open, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { site_name } = useSelector((state) => state.site)

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        h-full w-56 bg-white border-r border-zinc-100 shrink-0
        flex flex-col py-8 px-4 gap-1 transition-transform duration-200
        fixed top-0 left-0 z-30 lg:relative lg:z-auto lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <span className="text-sm font-semibold text-primary px-3 mb-6 tracking-tight flex items-center gap-2">
          <span className="bg-primary w-6 h-6 rounded-md flex items-center justify-center text-white text-xs">⬡</span>
          {site_name}
        </span>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {navItems.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `text-sm px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-secondary hover:text-primary hover:bg-zinc-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="text-sm px-3 py-2 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors text-left flex items-center gap-2.5"
        >
          <span className="text-xs">↩</span>
          Logout
        </button>
      </aside>
    </>
  )
}
