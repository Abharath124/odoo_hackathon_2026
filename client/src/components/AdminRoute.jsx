import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function AdminRoute() {
  const { user, isAuthenticated, loading, initialized } = useSelector((state) => state.auth)

  if (!initialized || loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/home" replace />

  return <Outlet />
}
