import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSiteSettings } from './store/siteSlice'
import { fetchMe } from './store/authSlice'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import GuestLayout from './layouts/GuestLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import GuestRoute from './components/GuestRoute'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'
import VerifyOtp from './pages/VerifyOtp'
import NotFound from './pages/NotFound'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import FAQ from './pages/FAQ'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const site = useSelector((state) => state.site)

  useEffect(() => {
    dispatch(fetchSiteSettings())
    if (token) dispatch(fetchMe())
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', site.primary_color)
    root.style.setProperty('--secondary', site.secondary_color)
    if (site.site_name) document.title = site.site_name
  }, [site])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<FAQ />} />

        <Route path="/" element={<Landing />} />

        {/* guest only */}
        <Route element={<GuestRoute />}>
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* user protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Route>

        {/* admin protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
