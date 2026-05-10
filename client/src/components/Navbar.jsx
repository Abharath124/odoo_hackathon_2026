import { useSelector } from 'react-redux'

export default function Navbar({ onMenuClick }) {
  const { user, loading } = useSelector((state) => state.auth)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : ''

  return (
    <header className="h-14 bg-white border-b border-zinc-100 flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex flex-col gap-1 p-1 rounded-md hover:bg-zinc-100 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="w-4 h-0.5 bg-secondary rounded" />
          <span className="w-4 h-0.5 bg-secondary rounded" />
          <span className="w-4 h-0.5 bg-secondary rounded" />
        </button>
        <span className="text-sm text-secondary">Good morning 👋</span>
      </div>

      <div className="flex items-center gap-3">
        {loading ? (
          <div className="h-3.5 w-24 bg-zinc-100 rounded animate-pulse hidden sm:block" />
        ) : (
          user?.name && <span className="text-xs text-secondary hidden sm:block">{user.name}</span>
        )}
        <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white overflow-hidden">
          {loading ? '' : user?.avatar
            ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
            : initials
          }
        </div>
      </div>
    </header>
  )
}
