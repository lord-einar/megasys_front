import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Cargar usuario actual
  const loadCurrentUser = useCallback(async () => {
    try {
      setLoading(true)
      const response = await authAPI.getMe()
      if (response.success && response.data) {
        setUser(response.data)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (err) {
      console.error('Error loading user:', err)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (err) {
        console.error('Error parsing stored user:', err)
      }
    }
    loadCurrentUser()
  }, [loadCurrentUser])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
  }, [])

  return {
    user,
    loading,
    error,
    isAuthenticated,
    logout,
    loadCurrentUser,
  }
}
