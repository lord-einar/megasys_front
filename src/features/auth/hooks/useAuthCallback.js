// ============================================
// src/features/auth/hooks/useAuthCallback.js
// Hook para manejar el callback de Azure AD
// ============================================
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationContext'
import { authService } from '../../../services/auth'

export const useAuthCallback = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showError, showSuccess } = useNotification()
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(location.search)
      const token = urlParams.get('token')
      const userStr = urlParams.get('user')
      const error = urlParams.get('error')
      
      // Si hay error, mostrarlo y redirigir al login
      if (error) {
        showError(decodeURIComponent(error))
        navigate('/login', { replace: true })
        return
      }
      
      // Si tenemos token del callback, procesarlo
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr))
          
          // Guardar en localStorage
          authService.saveAuthData({ 
            token, 
            user, 
            empresas: user.empresas_permitidas || [] 
          })
          
          showSuccess('Sesión iniciada correctamente')
          
          // Limpiar URL y redirigir al dashboard
          window.history.replaceState({}, document.title, '/dashboard')
          navigate('/dashboard', { replace: true })
          
        } catch (error) {
          console.error('Error procesando callback:', error)
          showError('Error procesando la autenticación')
          navigate('/login', { replace: true })
        }
      }
    }
    
    handleCallback()
  }, [location.search, navigate, showError, showSuccess])
}

export default useAuthCallback