import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute() {
  const { isAuthenticated, loading, initialized } = useSelector((state) => state.auth)

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 size={20} className="text-zinc-400 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
