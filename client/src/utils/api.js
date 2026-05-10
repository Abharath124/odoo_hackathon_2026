import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const is401 = error.response?.status === 401
    const url = error.config?.url || ''
    const skipRoutes = ['/auth/me', '/auth/login', '/admin/settings/public']
    const isSkipped = skipRoutes.some((r) => url.includes(r))
    const alreadyOnLogin = window.location.pathname === '/login'

    if (is401 && !isSkipped && !alreadyOnLogin) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
