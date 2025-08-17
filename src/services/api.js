// ============================================
// src/services/api.js
// Cliente HTTP centralizado con interceptores
// ============================================
import axios from 'axios'
import { API_CONFIG, APP_CONFIG } from './config'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests - agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Agregar empresa actual si existe
    const empresaId = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.EMPRESA)
    if (empresaId) {
      config.headers['X-Empresa-Id'] = empresaId
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses - manejo de errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Si es error 401 y no es retry, intentar refrescar token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Limpiar tokens y redirigir al login
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN)
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
        window.location.href = '/login'
        return Promise.reject(error)
      } catch (refreshError) {
        // Si falla el refresh, limpiar todo y redirigir
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    // Si es error 403, mostrar mensaje de permisos
    if (error.response?.status === 403) {
      console.warn('Sin permisos para esta operación')
    }
    
    return Promise.reject(error)
  }
)

// Funciones de la API
export const authAPI = {
  // Obtener URL de login de Azure AD
  getLoginUrl: () => api.get('/auth/login'),
  
  // Verificar token actual
  verifyToken: () => api.get('/auth/verify'),
  
  // Refrescar token
  refreshToken: () => api.post('/auth/refresh'),
  
  // Logout
  logout: () => api.post('/auth/logout'),
}

export const userAPI = {
  // Obtener perfil del usuario
  getProfile: () => api.get('/auth/verify'),
  
  // Obtener empresas del usuario
  getEmpresas: () => api.get('/user/empresas'),
  
  // Actualizar preferencias
  updatePreferences: (preferences) => api.patch('/user/preferences', preferences),
}

export const sedesAPI = {
  // Listar sedes
  list: (params = {}) => api.get('/sedes', { params }),
  
  // Obtener sede por ID
  getById: (id) => api.get(`/sedes/${id}`),
  
  // Crear sede
  create: (data) => api.post('/sedes', data),
  
  // Actualizar sede
  update: (id, data) => api.put(`/sedes/${id}`, data),
  
  // Eliminar sede
  delete: (id) => api.delete(`/sedes/${id}`),
  
  // Estadísticas de sede
  getStats: (id) => api.get(`/sedes/${id}/stats`),
}

export const personalAPI = {
  // Listar personal
  list: (params = {}) => api.get('/personal', { params }),
  
  // Obtener personal por ID
  getById: (id) => api.get(`/personal/${id}`),
  
  // Crear personal
  create: (data) => api.post('/personal', data),
  
  // Actualizar personal
  update: (id, data) => api.put(`/personal/${id}`, data),
  
  // Eliminar personal
  delete: (id) => api.delete(`/personal/${id}`),
}

export const inventarioAPI = {
  // Listar inventario
  list: (params = {}) => api.get('/inventario', { params }),
  
  // Obtener item por ID
  getById: (id) => api.get(`/inventario/${id}`),
  
  // Crear item
  create: (data) => api.post('/inventario', data),
  
  // Actualizar item
  update: (id, data) => api.put(`/inventario/${id}`, data),
  
  // Eliminar item
  delete: (id) => api.delete(`/inventario/${id}`),
  
  // Gestión de préstamos
  marcarPrestamo: (id, data) => api.post(`/inventario/${id}/prestamo`, data),
  devolverPrestamo: (id, observaciones) => api.post(`/inventario/${id}/devolucion`, { observaciones }),
  
  // Reportes
  proximosVencer: (params = {}) => api.get('/inventario/prestamos/proximos', { params }),
  vencidos: (params = {}) => api.get('/inventario/prestamos/vencidos', { params }),
}

export const remitosAPI = {
  // Listar remitos
  list: (params = {}) => api.get('/remitos', { params }),
  
  // Obtener remito por ID
  getById: (id) => api.get(`/remitos/${id}`),
  
  // Crear remito
  create: (data) => api.post('/remitos', data),
  
  // Actualizar estado
  updateEstado: (id, data) => api.patch(`/remitos/${id}/estado`, data),
  
  // Reenviar confirmación
  reenviarConfirmacion: (id) => api.post(`/remitos/${id}/reenviar-confirmacion`),
  
  // Descargar PDF
  downloadPDF: (id, tipo) => api.get(`/remitos/${id}/pdf/${tipo}`, { responseType: 'blob' }),
}

export const dashboardAPI = {
  // Estadísticas generales
  getStats: () => api.get('/dashboard/stats'),
  
  // Métricas de préstamos
  getPrestamoMetrics: (params = {}) => api.get('/dashboard/prestamos', { params }),
  
  // Actividad reciente
  getRecentActivity: (params = {}) => api.get('/dashboard/actividad', { params }),
  
  // Alertas del sistema
  getAlerts: () => api.get('/dashboard/alertas'),
}

// Función helper para manejar errores de API
export const handleAPIError = (error) => {
  if (error.response) {
    // El servidor respondió con un status de error
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return {
          message: data.message || 'Datos inválidos',
          errors: data.errors || [],
        }
      case 401:
        return {
          message: 'No autorizado. Por favor, inicie sesión nuevamente.',
          type: 'auth_error',
        }
      case 403:
        return {
          message: 'Sin permisos para realizar esta operación',
          type: 'permission_error',
        }
      case 404:
        return {
          message: 'Recurso no encontrado',
          type: 'not_found',
        }
      case 409:
        return {
          message: data.message || 'El recurso ya existe',
          type: 'conflict',
        }
      case 422:
        return {
          message: 'Errores de validación',
          errors: data.errors || [],
          type: 'validation_error',
        }
      case 500:
        return {
          message: 'Error interno del servidor. Intente nuevamente.',
          type: 'server_error',
        }
      default:
        return {
          message: data.message || 'Error desconocido',
          type: 'unknown_error',
        }
    }
  } else if (error.request) {
    // El request fue hecho pero no hubo respuesta
    return {
      message: 'No se pudo conectar con el servidor. Verifique su conexión.',
      type: 'network_error',
    }
  } else {
    // Algo pasó al configurar el request
    return {
      message: error.message || 'Error desconocido',
      type: 'client_error',
    }
  }
}

// Función para descargar archivos
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    
    // Crear URL temporal del blob
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    
    // Crear link temporal y hacer click
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    
    // Limpiar
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    return true
  } catch (error) {
    console.error('Error descargando archivo:', error)
    throw handleAPIError(error)
  }
}

export default api