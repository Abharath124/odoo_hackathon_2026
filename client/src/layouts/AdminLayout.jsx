import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        <header className="h-14 bg-white border-b border-zinc-100 flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex flex-col gap-1 p-1 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <span className="w-4 h-0.5 bg-secondary rounded" />
              <span className="w-4 h-0.5 bg-secondary rounded" />
              <span className="w-4 h-0.5 bg-secondary rounded" />
            </button>
            <span className="text-xs font-medium bg-primary text-white px-2.5 py-0.5 rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user?.name && <span className="text-xs text-secondary hidden sm:block">{user.name}</span>}
            <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white overflow-hidden">
              {user?.avatar
                ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                : initials
              }
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
