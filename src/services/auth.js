// ============================================
// src/services/auth.js
// Servicio de autenticación con Azure AD
// ============================================
import { msalConfig, loginRequest, graphConfig, APP_CONFIG } from './config'
import { authAPI } from './api'

class AuthService {
  constructor() {
    this.msalInstance = null
  }
  
  // Inicializar con instancia MSAL
  initialize(msalInstance) {
    this.msalInstance = msalInstance
  }
  
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN)
    const user = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER)
    return !!(token && user)
  }
  
  // Obtener usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER)
    return userStr ? JSON.parse(userStr) : null
  }
  
  // Obtener token actual
  getToken() {
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN)
  }
  
  // Iniciar login con Azure AD
  async loginWithAzure() {
    try {
      // En lugar de usar MSAL popup, redirigir directamente al backend
      // que manejará todo el flujo de OAuth con Azure AD
      
      // Verificar si estamos regresando del callback de Azure
      const urlParams = new URLSearchParams(window.location.search)
      const authCode = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (error) {
        throw new Error(`Error de Azure AD: ${error}`)
      }
      
      if (authCode) {
        // Tenemos un código de autorización, procesarlo
        return await this.handleAuthResponse({ account: { username: 'temp' } })
      } else {
        // Redirigir al endpoint de login del backend
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`
        return
      }
      
    } catch (error) {
      console.error('Error en login:', error)
      throw new Error('Error al iniciar sesión con Azure AD')
    }
  }
  
  // Manejar respuesta de autenticación
  async handleAuthResponse(response) {
    try {
      if (!response || !response.account) {
        throw new Error('Respuesta de autenticación inválida')
      }
      
      // En lugar de enviar datos al backend, redirigir al callback de Azure AD
      // El backend manejará todo el flujo de OAuth
      
      // Obtener el código de autorización desde la URL después del login
      const urlParams = new URLSearchParams(window.location.search)
      const authCode = urlParams.get('code')
      
      if (!authCode) {
        // Si no hay código, iniciar el flujo completo
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`
        return
      }
      
      // Si tenemos el código, validar con el backend
      const backendResponse = await this.validateWithBackend({ authCode })
      
      // Guardar información en localStorage
      this.saveAuthData(backendResponse)
      
      return backendResponse
      
    } catch (error) {
      console.error('Error procesando respuesta de auth:', error)
      throw new Error('Error al procesar la autenticación')
    }
  }
  
  // Obtener foto del usuario desde Microsoft Graph
  async getUserPhoto(accessToken) {
    try {
      const response = await fetch(graphConfig.graphMePhotoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      if (response.ok) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
      
      return null
    } catch (error) {
      console.warn('Error obteniendo foto del usuario:', error)
      return null
    }
  }
  
  // Validar con el backend usando el flujo real de Azure AD
  async validateWithBackend(azureData) {
    try {
      // Usar el endpoint real del callback de Azure AD
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/callback?code=${azureData.authCode}`, {
        method: 'GET',
        credentials: 'include', // Para manejar cookies si es necesario
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error validando con el backend')
      }
      
      const data = await response.json()
      
      if (!data.success || !data.token) {
        throw new Error('Respuesta inválida del backend')
      }
      
      return {
        token: data.token,
        user: data.user,
        empresas: data.empresas || [],
      }
      
    } catch (error) {
      console.error('Error validando con backend:', error)
      throw new Error('Error al validar credenciales con el servidor')
    }
  }
  
  // Guardar datos de autenticación
  saveAuthData({ token, user, empresas }) {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token)
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user))
    
    // Si el usuario tiene empresas, seleccionar la primera por defecto
    if (empresas && empresas.length > 0) {
      const empresaActual = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.EMPRESA)
      if (!empresaActual || !empresas.find(e => e.id === empresaActual)) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.EMPRESA, empresas[0].id)
      }
    }
  }
  
  // Verificar token con el backend
  async verifyToken() {
    try {
      const response = await authAPI.verifyToken()
      
      if (response.data.success && response.data.user) {
        // Actualizar información del usuario
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.data.user))
        return response.data.user
      }
      
      throw new Error('Token inválido')
      
    } catch (error) {
      console.error('Error verificando token:', error)
      this.logout()
      throw error
    }
  }
  
  // Cambiar empresa actual
  changeCurrentEmpresa(empresaId) {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.EMPRESA, empresaId)
    // Recargar la página para aplicar el contexto de la nueva empresa
    window.location.reload()
  }
  
  // Obtener empresa actual
  getCurrentEmpresa() {
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.EMPRESA)
  }
  
  // Cerrar sesión
  async logout() {
    try {
      // Intentar logout en el backend
      try {
        await authAPI.logout()
      } catch (error) {
        console.warn('Error en logout del backend:', error)
      }
      
      // Logout de MSAL
      if (this.msalInstance) {
        const accounts = this.msalInstance.getAllAccounts()
        if (accounts.length > 0) {
          await this.msalInstance.logoutPopup({
            account: accounts[0],
            postLogoutRedirectUri: window.location.origin,
          })
        }
      }
      
      // Limpiar localStorage
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN)
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.EMPRESA)
      
      // Redirigir al login
      window.location.href = '/login'
      
    } catch (error) {
      console.error('Error en logout:', error)
      // Forzar limpieza y redirección aunque haya errores
      localStorage.clear()
      window.location.href = '/login'
    }
  }
  
  // Obtener permisos del usuario
  getUserPermissions() {
    const user = this.getCurrentUser()
    if (!user) return []
    
    return user.grupos_ad_ids || []
  }
  
  // Verificar si el usuario tiene un permiso específico
  hasPermission(groupId) {
    const permissions = this.getUserPermissions()
    return user?.es_super_admin || permissions.includes(groupId)
  }
  
  // Verificar si el usuario es super admin
  isSuperAdmin() {
    const user = this.getCurrentUser()
    return user?.es_super_admin || false
  }
}

// Exportar instancia única
export const authService = new AuthService()
export default authService