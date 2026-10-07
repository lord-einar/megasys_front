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
  const response = await fetch(`${API_BASE_URL}/autogestion${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const data = (response.headers.get('content-type') || '').includes('application/json') ? await response.json() : null

  if (!response.ok) {
    if (response.status === 401) sesionAutogestion.cerrar()
    const error = new Error(data?.message || `Error HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

export const autogestionAPI = {
  urlLogin: () => llamar('/login'),
  devUsuarios: () => llamar('/dev-usuarios'),
  devLogin: (email) => llamar('/dev-login', { method: 'POST', body: JSON.stringify({ email }) }),
  me: () => llamar('/me')
}
