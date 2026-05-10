import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export function PublicNav() {
  const { site_name } = useSelector((state) => state.site)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { pathname } = useLocation()
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/home'

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 bg-white/60 backdrop-blur-sm">
      <Link to="/" className="text-sm font-semibold text-primary flex items-center gap-2">
        <span className="bg-primary w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs">⬡</span>
        {site_name}
      </Link>
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <Link to={dashboardPath} className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:opacity-80 transition-all">Dashboard</Link>
        ) : (
          <>
            {pathname != '/login' && <Link to="/login" className="text-sm text-secondary hover:text-primary transition-colors">Sign in</Link>}
            {pathname != '/signup' && <Link to="/signup" className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:opacity-80 transition-all">Get started</Link>}
          </>
        )}
      </div>
    </nav>
  )
}

export function PublicFooter() {
  const { site_name } = useSelector((state) => state.site)

  return (
    <footer className="border-t border-zinc-100 px-8 py-5 flex items-center justify-between bg-white/60 backdrop-blur-sm">
      <span className="text-xs text-secondary">© 2026 {site_name}</span>
      <div className="flex items-center gap-4">
        <Link to="/terms" className="text-xs text-secondary hover:text-primary transition-colors">Terms</Link>
        <Link to="/privacy" className="text-xs text-secondary hover:text-primary transition-colors">Privacy</Link>
        <Link to="/faq" className="text-xs text-secondary hover:text-primary transition-colors">FAQ</Link>
      </div>
    </footer>
  )
}
