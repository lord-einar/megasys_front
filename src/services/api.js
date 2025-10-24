// API Base Configuration - backend running on port 4000
const API_BASE_URL = 'http://localhost:4000/api'

// Helper para hacer requests con auth token
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Si es 401, el token expiró
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }

    // Algunos endpoints pueden devolver solo headers sin body
    const contentType = response.headers.get('content-type')
    let data = null

    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    }

    if (!response.ok) {
      throw new Error(data?.message || `Error HTTP ${response.status}`)
    }

    return data || { success: response.ok }
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Auth Endpoints
export const authAPI = {
  login: () => apiCall('/auth/login'),
  callback: (code) => apiCall(`/auth/callback?code=${code}`),
  getMe: () => apiCall('/auth/me'),
  getStatus: () => apiCall('/auth/status'),
  refresh: (refreshToken) => apiCall('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  getPermissions: () => apiCall('/auth/permissions'),
  getPhoto: (userId) => apiCall(`/auth/photo/${userId}`),
  getPhotoBase64: () => apiCall('/auth/photo-base64'),
}

// Empresas Endpoints
export const empresasAPI = {
  getActivas: () => apiCall('/empresas/activas'),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/empresas${query ? '?' + query : ''}`)
  },
  getById: (id) => apiCall(`/empresas/${id}`),
  create: (data) => apiCall('/empresas', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/empresas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/empresas/${id}`, { method: 'DELETE' }),
}

// Sedes Endpoints
export const sedesAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/sedes${query ? '?' + query : ''}`)
  },
  getEstadisticas: () => apiCall('/sedes/estadisticas'),
  getById: (id) => apiCall(`/sedes/${id}`),
  create: (data) => apiCall('/sedes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/sedes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/sedes/${id}`, { method: 'DELETE' }),
  getPersonal: (id, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/sedes/${id}/personal${query ? '?' + query : ''}`)
  },
  getInventario: (id, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/sedes/${id}/inventario${query ? '?' + query : ''}`)
  },
  getServicios: (id, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/sedes/${id}/servicios${query ? '?' + query : ''}`)
  },
  assignService: (id, serviceData) => apiCall(`/sedes/${id}/servicios`, {
    method: 'POST',
    body: JSON.stringify(serviceData)
  }),
}

// Personal Endpoints
export const personalAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/personal${query ? '?' + query : ''}`)
  },
  getEstadisticas: () => apiCall('/personal/estadisticas'),
  buscar: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/personal/buscar${query ? '?' + query : ''}`)
  },
  getById: (id) => apiCall(`/personal/${id}`),
  create: (data) => apiCall('/personal', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/personal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/personal/${id}`, { method: 'DELETE' }),
  getRemitos: (id, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/personal/${id}/remitos${query ? '?' + query : ''}`)
  },
  // PersonalSede methods (asignaciones)
  getSedes: (personalId) => apiCall(`/personal/${personalId}/sedes`),
  listAsignaciones: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/personal/sedes/asignaciones${query ? '?' + query : ''}`)
  },
  getSedePersonal: (sedeId) => apiCall(`/personal/sedes/${sedeId}`),
  crearAsignacion: (data) => apiCall('/personal/sedes/asignaciones', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  actualizarAsignacion: (id, data) => apiCall(`/personal/sedes/asignaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  eliminarAsignacion: (id) => apiCall(`/personal/sedes/asignaciones/${id}`, {
    method: 'DELETE'
  }),
  getEstadisticasAsignaciones: () => apiCall('/personal/sedes/estadisticas'),
}

// Inventario Endpoints
export const inventarioAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/inventario${query ? '?' + query : ''}`)
  },
  getEstadisticas: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/inventario/estadisticas${query ? '?' + query : ''}`)
  },
  buscar: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/inventario/buscar${query ? '?' + query : ''}`)
  },
  getById: (id) => apiCall(`/inventario/${id}`),
  create: (data) => apiCall('/inventario', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/inventario/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/inventario/${id}`, { method: 'DELETE' }),
  cambiarEstado: (id, estado, observaciones = '') => apiCall(`/inventario/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado, observaciones })
  }),
  getHistorial: (id, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/inventario/${id}/historial${query ? '?' + query : ''}`)
  },
}

// Remitos Endpoints
export const remitosAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/remitos${query ? '?' + query : ''}`)
  },
  getById: (id) => apiCall(`/remitos/${id}`),
  create: (data) => apiCall('/remitos', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/remitos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/remitos/${id}`, { method: 'DELETE' }),
  getDetalles: (id) => apiCall(`/remitos/${id}/detalles`),
}

// Proveedores Endpoints
export const proveedoresAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/proveedores${query ? '?' + query : ''}`)
  },
  getById: (id) => apiCall(`/proveedores/${id}`),
  create: (data) => apiCall('/proveedores', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/proveedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/proveedores/${id}`, { method: 'DELETE' }),
}

// Roles Endpoints
export const rolesAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/roles${query ? '?' + query : ''}`)
  },
  getById: (id) => apiCall(`/roles/${id}`),
  create: (data) => apiCall('/roles', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/roles/${id}`, { method: 'DELETE' }),
}

// TipoArticulo Endpoints
export const tipoArticuloAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/tipo-articulo${query ? '?' + query : ''}`)
  },
  getById: (id) => apiCall(`/tipo-articulo/${id}`),
  create: (data) => apiCall('/tipo-articulo', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/tipo-articulo/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/tipo-articulo/${id}`, { method: 'DELETE' }),
}

export default apiCall
