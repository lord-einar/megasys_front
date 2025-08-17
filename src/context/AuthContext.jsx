// ============================================
// src/context/AuthContext.jsx
// Contexto de autenticación con Azure AD
// ============================================
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { useLocation } from 'react-router-dom'
import { authService } from '../services/auth'
import { useNotification } from './NotificationContext'

// Estado inicial
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  empresas: [],
  empresaActual: null,
  permissions: [],
  error: null,
}

// Tipos de acciones
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_EMPRESAS: 'SET_EMPRESAS',
  SET_EMPRESA_ACTUAL: 'SET_EMPRESA_ACTUAL',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        empresas: action.payload.empresas || [],
        permissions: action.payload.user?.grupos_ad_ids || [],
        error: null,
      }
      
    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        empresas: [],
        permissions: [],
        error: action.payload,
      }
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      }
      
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        permissions: action.payload?.grupos_ad_ids || [],
      }
      
    case AUTH_ACTIONS.SET_EMPRESAS:
      return {
        ...state,
        empresas: action.payload,
      }
      
    case AUTH_ACTIONS.SET_EMPRESA_ACTUAL:
      return {
        ...state,
        empresaActual: action.payload,
      }
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
      
    default:
      return state
  }
}

// Crear contexto
const AuthContext = createContext()

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { instance: msalInstance } = useMsal()
  const location = useLocation()
  const { showError, showSuccess } = useNotification()
  
  // Inicializar servicio de auth
  useEffect(() => {
    authService.initialize(msalInstance)
  }, [msalInstance])
  
  // Verificar autenticación al cargar y manejar callback
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        
        // Verificar si estamos regresando del callback de Azure AD
        const urlParams = new URLSearchParams(location.search)
        const token = urlParams.get('token')
        const userStr = urlParams.get('user')
        const error = urlParams.get('error')
        
        if (error) {
          if (!isMounted) return;
          const errorMessage = decodeURIComponent(error)
          dispatch({
            type: AUTH_ACTIONS.LOGIN_ERROR,
            payload: errorMessage,
          })
          console.error('Error de callback:', errorMessage)
          return
        }
        
        if (token && userStr) {
          if (!isMounted) return;
          // Procesar callback exitoso
          try {
            const user = JSON.parse(decodeURIComponent(userStr))
            
            // Guardar en localStorage
            authService.saveAuthData({ 
              token, 
              user, 
              empresas: user.empresas_permitidas || [] 
            })
            
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user,
                empresas: user.empresas_permitidas || [],
              },
            })
            
            // Establecer empresa actual
            const empresaActual = authService.getCurrentEmpresa()
            if (empresaActual && isMounted) {
              dispatch({
                type: AUTH_ACTIONS.SET_EMPRESA_ACTUAL,
                payload: empresaActual,
              })
            }
            
            // Limpiar URL sin causar re-render
            if (isMounted) {
              window.history.replaceState({}, document.title, '/dashboard')
            }
            
          } catch (parseError) {
            if (!isMounted) return;
            console.error('Error procesando datos del callback:', parseError)
            dispatch({
              type: AUTH_ACTIONS.LOGIN_ERROR,
              payload: 'Error procesando la autenticación',
            })
          }
          
          return
        }
        
        // Verificar si hay token guardado
        if (authService.isAuthenticated()) {
          try {
            if (!isMounted) return;
            // Verificar token con el backend
            const user = await authService.verifyToken()
            
            if (!isMounted) return;
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user,
                empresas: user.empresas_permitidas || [],
              },
            })
            
            // Establecer empresa actual
            const empresaActual = authService.getCurrentEmpresa()
            if (empresaActual && isMounted) {
              dispatch({
                type: AUTH_ACTIONS.SET_EMPRESA_ACTUAL,
                payload: empresaActual,
              })
            }
          } catch (verifyError) {
            if (!isMounted) return;
            console.error('Error verificando token:', verifyError)
            // Token inválido, limpiar y continuar sin auth
            authService.logout()
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
          }
        } else {
          if (!isMounted) return;
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
        
      } catch (error) {
        if (!isMounted) return;
        console.error('Error inicializando auth:', error)
        dispatch({
          type: AUTH_ACTIONS.LOGIN_ERROR,
          payload: error.message,
        })
      }
    }
    
    initializeAuth()
    
    return () => {
      isMounted = false;
    }
  }, [location.search]) // Solo depender de location.search
  
  // Función de login
  const login = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
      
      const result = await authService.loginWithAzure()
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: result,
      })
      
      // Establecer empresa por defecto si existe
      if (result.empresas && result.empresas.length > 0) {
        const empresaActual = authService.getCurrentEmpresa()
        dispatch({
          type: AUTH_ACTIONS.SET_EMPRESA_ACTUAL,
          payload: empresaActual || result.empresas[0].id,
        })
      }
      
      showSuccess('Sesión iniciada correctamente')
      return result
      
    } catch (error) {
      console.error('Error en login:', error)
      const errorMessage = error.message || 'Error al iniciar sesión'
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      })
      
      showError(errorMessage)
      throw error
    }
  }
  
  // Función de logout
  const logout = async () => {
    try {
      await authService.logout()
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      showSuccess('Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error en logout:', error)
      showError('Error al cerrar sesión')
      // Forzar logout local aunque falle
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }
  
  // Cambiar empresa actual
  const changeEmpresa = (empresaId) => {
    try {
      authService.changeCurrentEmpresa(empresaId)
      dispatch({
        type: AUTH_ACTIONS.SET_EMPRESA_ACTUAL,
        payload: empresaId,
      })
    } catch (error) {
      console.error('Error cambiando empresa:', error)
      showError('Error al cambiar empresa')
    }
  }
  
  // Verificar permisos
  const hasPermission = (groupId) => {
    return authService.hasPermission(groupId)
  }
  
  // Verificar si es super admin
  const isSuperAdmin = () => {
    return authService.isSuperAdmin()
  }
  
  // Obtener empresa actual completa
  const getCurrentEmpresa = () => {
    if (!state.empresaActual || !state.empresas.length) return null
    return state.empresas.find(e => e.id === state.empresaActual)
  }
  
  // Refrescar datos del usuario
  const refreshUser = async () => {
    try {
      const user = await authService.verifyToken()
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user })
      return user
    } catch (error) {
      console.error('Error refrescando usuario:', error)
      throw error
    }
  }
  
  // Limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }
  
  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Funciones
    login,
    logout,
    changeEmpresa,
    hasPermission,
    isSuperAdmin,
    getCurrentEmpresa,
    refreshUser,
    clearError,
    
    // Utilidades
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
  }
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext