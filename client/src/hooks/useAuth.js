import { useState, useCallback } from 'react'

const TOKEN_KEY = 'token'

export function useAuth() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY))

  const setToken = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setTokenState(newToken)
  }, [])

  const removeToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setTokenState(null)
  }, [])

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), [])

  const isAuthenticated = !!token

  return { token, setToken, removeToken, getToken, isAuthenticated }
}
