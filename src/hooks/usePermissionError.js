import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

/**
 * Hook para manejar mensajes de error cuando un usuario es redirigido
 * por falta de permisos u otros motivos
 *
 * Busca en location.state.error y muestra un SweetAlert si existe,
 * luego limpia el state para evitar que se muestre nuevamente
 *
 * @example
 * function MyPage() {
 *   usePermissionError()
 *   // ... resto del componente
 * }
 */
export const usePermissionError = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.error) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: location.state.error,
        confirmButtonColor: '#3b82f6'
      })

      // Limpiar el state para que no se muestre de nuevo
      // al navegar dentro de la página
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])
}

/**
 * Hook para mostrar cualquier tipo de mensaje (éxito, error, info, etc.)
 * desde location.state
 *
 * Soporta:
 * - location.state.error (mensaje de error)
 * - location.state.success (mensaje de éxito)
 * - location.state.message (mensaje genérico)
 *
 * @example
 * // En la página que redirige:
 * navigate('/personal', {
 *   state: { success: 'Personal creado correctamente' }
 * })
 *
 * // En la página destino:
 * function PersonalPage() {
 *   useLocationMessage()
 *   // ... resto del componente
 * }
 */
export const useLocationMessage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const state = location.state

    if (!state) return

    // Mensaje de error
    if (state.error) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: state.error,
        confirmButtonColor: '#3b82f6'
      })
    }
    // Mensaje de éxito
    else if (state.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: state.success,
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true
      })
    }
    // Mensaje genérico con info
    else if (state.message) {
      Swal.fire({
        icon: state.icon || 'info',
        title: state.title || 'Información',
        text: state.message,
        confirmButtonColor: '#3b82f6'
      })
    }

    // Limpiar el state después de mostrar el mensaje
    if (state.error || state.success || state.message) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])
}
