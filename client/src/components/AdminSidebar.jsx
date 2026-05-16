import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import api from '../utils/api'
import BrandLogo from './BrandLogo'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Settings', path: '/admin/settings' },
]

export default function AdminSidebar({ open, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { site_name } = useSelector((state) => state.site)

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch (_) { }
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-56 shrink-0 bg-primary
        flex flex-col py-8 px-4 z-30 transition-transform duration-200
        lg:static lg:translate-x-0 lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-2 px-3 mb-8">
          <BrandLogo />
          <span className="text-sm font-semibold text-white tracking-tight">{site_name}</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `text-sm px-3 py-2 rounded-lg transition-colors ${isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full text-sm px-3 py-2 rounded-lg text-white/50 hover:text-red-300 hover:bg-white/5 transition-colors text-left"
          >
            ↩ Logout
          </button>
        </div>
      </aside>
    </>
  )
}
