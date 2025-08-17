// ============================================
// src/context/NotificationContext.jsx
// Contexto para notificaciones con react-hot-toast
// ============================================
import React, { createContext, useContext, useCallback } from 'react'
import toast from 'react-hot-toast'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline'

// Crear contexto
const NotificationContext = createContext()

// Hook personalizado
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider')
  }
  return context
}

// Componente de toast personalizado
const CustomToast = ({ icon: Icon, iconColor, title, message, onClose }) => (
  <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-lg border max-w-md">
    <div className={`flex-shrink-0 ${iconColor}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      {title && (
        <p className="text-sm font-medium text-gray-900">{title}</p>
      )}
      <p className="text-sm text-gray-600">{message}</p>
    </div>
    <button
      onClick={onClose}
      className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
    >
      <XCircleIcon className="h-4 w-4" />
    </button>
  </div>
)

// Provider
export const NotificationProvider = ({ children }) => {
  // Función para mostrar notificación de éxito
  const showSuccess = useCallback((message, options = {}) => {
    const { title, duration = 3000, ...restOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          icon={CheckCircleIcon}
          iconColor="text-green-500"
          title={title}
          message={message}
          onClose={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration,
        ...restOptions,
      }
    )
  }, [])

  // Función para mostrar notificación de error
  const showError = useCallback((message, options = {}) => {
    const { title, duration = 5000, ...restOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          icon={XCircleIcon}
          iconColor="text-red-500"
          title={title}
          message={message}
          onClose={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration,
        ...restOptions,
      }
    )
  }, [])

  // Función para mostrar notificación de advertencia
  const showWarning = useCallback((message, options = {}) => {
    const { title, duration = 4000, ...restOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          icon={ExclamationTriangleIcon}
          iconColor="text-yellow-500"
          title={title}
          message={message}
          onClose={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration,
        ...restOptions,
      }
    )
  }, [])

  // Función para mostrar notificación informativa
  const showInfo = useCallback((message, options = {}) => {
    const { title, duration = 4000, ...restOptions } = options
    
    return toast.custom(
      (t) => (
        <CustomToast
          icon={InformationCircleIcon}
          iconColor="text-blue-500"
          title={title}
          message={message}
          onClose={() => toast.dismiss(t.id)}
        />
      ),
      {
        duration,
        ...restOptions,
      }
    )
  }, [])

  // Función para mostrar notificación de carga
  const showLoading = useCallback((message, options = {}) => {
    return toast.loading(message, {
      style: {
        background: '#fff',
        color: '#374151',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb',
      },
      ...options,
    })
  }, [])

  // Función para actualizar un toast existente
  const updateToast = useCallback((toastId, message, type = 'success') => {
    const toastFunctions = {
      success: toast.success,
      error: toast.error,
      loading: toast.loading,
    }
    
    return toastFunctions[type](message, { id: toastId })
  }, [])

  // Función para cerrar todos los toasts
  const dismissAll = useCallback(() => {
    toast.dismiss()
  }, [])

  // Función para cerrar un toast específico
  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId)
  }, [])

  // Función para mostrar confirmación personalizada
  const showConfirm = useCallback((message, onConfirm, options = {}) => {
    const { 
      title = 'Confirmar acción',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      variant = 'danger'
    } = options

    return toast.custom(
      (t) => (
        <div className="flex flex-col space-y-3 p-4 bg-white rounded-lg shadow-lg border max-w-sm">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${
              variant === 'danger' ? 'text-red-500' : 'text-yellow-500'
            }`}>
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                toast.dismiss(t.id)
              }}
              className={`px-3 py-1.5 text-sm text-white rounded-md transition-colors ${
                variant === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    )
  }, [])

  // Funciones de utilidad para casos comunes
  const notifySuccess = useCallback((action, item = '') => {
    const messages = {
      create: `${item} creado correctamente`,
      update: `${item} actualizado correctamente`,
      delete: `${item} eliminado correctamente`,
      save: `${item} guardado correctamente`,
    }
    showSuccess(messages[action] || `${action} completado correctamente`)
  }, [showSuccess])

  const notifyError = useCallback((action, item = '', error = null) => {
    const messages = {
      create: `Error al crear ${item}`,
      update: `Error al actualizar ${item}`,
      delete: `Error al eliminar ${item}`,
      save: `Error al guardar ${item}`,
      load: `Error al cargar ${item}`,
      network: 'Error de conexión. Verifique su internet.',
      permission: 'No tiene permisos para realizar esta acción',
    }
    
    let message = messages[action] || `Error en ${action}`
    
    if (error && typeof error === 'string') {
      message = error
    } else if (error && error.message) {
      message = error.message
    }
    
    showError(message)
  }, [showError])

  // Valor del contexto
  const contextValue = {
    // Funciones básicas
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    
    // Funciones avanzadas
    updateToast,
    dismissAll,
    dismiss,
    showConfirm,
    
    // Funciones de utilidad
    notifySuccess,
    notifyError,
    
    // Acceso directo a toast
    toast,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext