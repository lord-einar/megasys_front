// Cliente de la API de autogestión. Sesión propia (clave distinta del portal):
// el token de autogestión no sirve en el portal y un 401 acá no redirige al login.
import { API_BASE_URL } from '../config/api'

export const TOKEN_KEY = 'autogestionToken'

export const sesionAutogestion = {
  token: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  guardar: (token) => { try { localStorage.setItem(TOKEN_KEY, token) } catch { /* sin storage: sesión en memoria */ } },
  cerrar: () => { try { localStorage.removeItem(TOKEN_KEY) } catch { /* nada que limpiar */ } }
}

async function llamar(endpoint, options = {}) {
  const token = sesionAutogestion.token()
  // Con FormData el navegador pone el Content-Type (multipart con boundary)
  const esArchivo = options.body instanceof FormData
  const response = await fetch(`${API_BASE_URL}/autogestion${endpoint}`, {
    ...options,
    headers: {
      ...(esArchivo ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const data = (response.headers.get('content-type') || '').includes('application/json') ? await response.json() : null

  if (!response.ok) {
    if (response.status === 401) sesionAutogestion.cerrar()
    // Errores de validación: mostrar el detalle por campo
    const detalle = Array.isArray(data?.errors) ? data.errors.map(e => e.message).filter(Boolean).join(' | ') : null
    const error = new Error(detalle || data?.message || `Error HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

export const autogestionAPI = {
  urlLogin: () => llamar('/login'),
  devUsuarios: () => llamar('/dev-usuarios'),
  devLogin: (email) => llamar('/dev-login', { method: 'POST', body: JSON.stringify({ email }) }),
  me: () => llamar('/me'),
  misEquipos: (params = {}) => llamar(`/mis-equipos${params.tipo_equipo ? `?tipo_equipo=${encodeURIComponent(params.tipo_equipo)}` : ''}`),

  misPedidos: () => llamar('/pedidos'),
  crearPedido: (datos) => llamar('/pedidos', { method: 'POST', body: JSON.stringify(datos) }),
  cancelarPedido: (id) => llamar(`/pedidos/${id}/cancelar`, { method: 'POST' }),
  subirAdjunto: (id, tipo, archivo) => {
    const form = new FormData()
    form.append('tipo', tipo)
    form.append('archivo', archivo)
    return llamar(`/pedidos/${id}/adjuntos`, { method: 'POST', body: form })
  },

  pendientesDeAprobar: () => llamar('/aprobaciones'),
  paraAprobar: (id) => llamar(`/aprobaciones/${id}`),
  aprobar: (id, nota) => llamar(`/aprobaciones/${id}/aprobar`, { method: 'POST', body: JSON.stringify({ nota: nota || null }) }),
  rechazar: (id, motivo) => llamar(`/aprobaciones/${id}/rechazar`, { method: 'POST', body: JSON.stringify({ motivo }) })
}

// Pantalla a la que volver después de ingresar con Microsoft (p. ej. el link del mail de aprobación)
const VOLVER_KEY = 'autogestionVolverA'
export const volverDespuesDelLogin = {
  guardar: (ruta) => { try { sessionStorage.setItem(VOLVER_KEY, ruta) } catch { /* sin storage */ } },
  tomar: () => {
    try {
      const ruta = sessionStorage.getItem(VOLVER_KEY)
      sessionStorage.removeItem(VOLVER_KEY)
      return ruta
    } catch { return null }
  }
}
