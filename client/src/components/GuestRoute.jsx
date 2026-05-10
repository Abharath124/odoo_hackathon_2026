import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function GuestRoute() {
  const { isAuthenticated, user, loading, initialized } = useSelector((state) => state.auth)

  if (!initialized || loading) return null

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/home'} replace />
  }

  return <Outlet />
}
