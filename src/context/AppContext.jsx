// ============================================
// src/context/AppContext.jsx
// Contexto global de la aplicación
// ============================================
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { APP_CONFIG } from '../services/config'

// Estado inicial
const initialState = {
  // UI State
  sidebarOpen: true,
  theme: 'light',
  
  // App State
  loading: false,
  online: navigator.onLine,
  
  // Configuración
  pageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
  preferences: {
    notifications: true,
    autoRefresh: true,
    compactMode: false,
  },
  
  // Datos globales
  empresas: [],
  currentRoute: '/',
}

// Tipos de acciones
const APP_ACTIONS = {
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_THEME: 'SET_THEME',
  SET_LOADING: 'SET_LOADING',
  SET_ONLINE: 'SET_ONLINE',
  SET_PAGE_SIZE: 'SET_PAGE_SIZE',
  SET_PREFERENCES: 'SET_PREFERENCES',
  UPDATE_PREFERENCE: 'UPDATE_PREFERENCE',
  SET_EMPRESAS: 'SET_EMPRESAS',
  SET_CURRENT_ROUTE: 'SET_CURRENT_ROUTE',
  RESET_STATE: 'RESET_STATE',
}

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload,
      }
      
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      }
      
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      }
      
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
      
    case APP_ACTIONS.SET_ONLINE:
      return {
        ...state,
        online: action.payload,
      }
      
    case APP_ACTIONS.SET_PAGE_SIZE:
      return {
        ...state,
        pageSize: action.payload,
      }
      
    case APP_ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        preferences: action.payload,
      }
      
    case APP_ACTIONS.UPDATE_PREFERENCE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.payload.key]: action.payload.value,
        },
      }
      
    case APP_ACTIONS.SET_EMPRESAS:
      return {
        ...state,
        empresas: action.payload,
      }
      
    case APP_ACTIONS.SET_CURRENT_ROUTE:
      return {
        ...state,
        currentRoute: action.payload,
      }
      
    case APP_ACTIONS.RESET_STATE:
      return {
        ...initialState,
        online: state.online,
      }
      
    default:
      return state
  }
}

// Crear contexto
const AppContext = createContext()

// Hook personalizado
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider')
  }
  return context
}

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  // Cargar preferencias guardadas al inicializar
  useEffect(() => {
    const loadSavedPreferences = () => {
      try {
        // Cargar tema
        const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME)
        if (savedTheme && savedTheme !== state.theme) {
          dispatch({ type: APP_ACTIONS.SET_THEME, payload: savedTheme })
          // Aplicar tema al documento
          document.documentElement.classList.toggle('dark', savedTheme === 'dark')
        }
        
        // Cargar preferencias
        const savedPreferences = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PREFERENCES)
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences)
          if (JSON.stringify(preferences) !== JSON.stringify(state.preferences)) {
            dispatch({ 
              type: APP_ACTIONS.SET_PREFERENCES, 
              payload: preferences
            })
          }
        }
        
        // Cargar estado del sidebar
        const sidebarOpen = localStorage.getItem('megasys_sidebar_open')
        if (sidebarOpen !== null) {
          const isOpen = JSON.parse(sidebarOpen)
          if (isOpen !== state.sidebarOpen) {
            dispatch({ 
              type: APP_ACTIONS.SET_SIDEBAR_OPEN, 
              payload: isOpen
            })
          }
        }
        
      } catch (error) {
        console.error('Error cargando preferencias:', error)
      }
    }
    
    loadSavedPreferences()
  }, []) // Solo ejecutar una vez al montar
  
  // Escuchar cambios de conectividad
  useEffect(() => {
    const handleOnline = () => dispatch({ type: APP_ACTIONS.SET_ONLINE, payload: true })
    const handleOffline = () => dispatch({ type: APP_ACTIONS.SET_ONLINE, payload: false })
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Funciones del contexto
  
  // Alternar sidebar
  const toggleSidebar = () => {
    const newState = !state.sidebarOpen
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR })
    localStorage.setItem('megasys_sidebar_open', JSON.stringify(newState))
  }
  
  // Establecer estado del sidebar
  const setSidebarOpen = (open) => {
    dispatch({ type: APP_ACTIONS.SET_SIDEBAR_OPEN, payload: open })
    localStorage.setItem('megasys_sidebar_open', JSON.stringify(open))
  }
  
  // Cambiar tema
  const setTheme = (theme) => {
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme })
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
  
  // Alternar tema
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  // Establecer loading global
  const setLoading = (loading) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading })
  }
  
  // Actualizar preferencia individual
  const updatePreference = (key, value) => {
    dispatch({ 
      type: APP_ACTIONS.UPDATE_PREFERENCE, 
      payload: { key, value } 
    })
    
    // Guardar en localStorage
    const newPreferences = { ...state.preferences, [key]: value }
    localStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.PREFERENCES, 
      JSON.stringify(newPreferences)
    )
  }
  
  // Establecer todas las preferencias
  const setPreferences = (preferences) => {
    dispatch({ type: APP_ACTIONS.SET_PREFERENCES, payload: preferences })
    localStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.PREFERENCES, 
      JSON.stringify(preferences)
    )
  }
  
  // Establecer tamaño de página
  const setPageSize = (size) => {
    dispatch({ type: APP_ACTIONS.SET_PAGE_SIZE, payload: size })
    updatePreference('pageSize', size)
  }
  
  // Establecer empresas
  const setEmpresas = (empresas) => {
    dispatch({ type: APP_ACTIONS.SET_EMPRESAS, payload: empresas })
  }
  
  // Establecer ruta actual
  const setCurrentRoute = (route) => {
    dispatch({ type: APP_ACTIONS.SET_CURRENT_ROUTE, payload: route })
  }
  
  // Reset del estado
  const resetState = () => {
    dispatch({ type: APP_ACTIONS.RESET_STATE })
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.PREFERENCES)
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.THEME)
    localStorage.removeItem('megasys_sidebar_open')
  }
  
  // Funciones de utilidad
  
  // Verificar si está en dispositivo móvil
  const isMobile = () => {
    return window.innerWidth < 768
  }
  
  // Verificar si está en tablet
  const isTablet = () => {
    return window.innerWidth >= 768 && window.innerWidth < 1024
  }
  
  // Verificar si está en desktop
  const isDesktop = () => {
    return window.innerWidth >= 1024
  }
  
  // Obtener breakpoint actual
  const getBreakpoint = () => {
    if (isMobile()) return 'mobile'
    if (isTablet()) return 'tablet'
    return 'desktop'
  }
  
  // Obtener configuración responsiva del sidebar
  const getSidebarConfig = () => {
    const breakpoint = getBreakpoint()
    
    if (breakpoint === 'mobile') {
      return {
        shouldShow: state.sidebarOpen,
        isOverlay: true,
        collapsible: true,
      }
    }
    
    if (breakpoint === 'tablet') {
      return {
        shouldShow: state.sidebarOpen,
        isOverlay: false,
        collapsible: true,
      }
    }
    
    return {
      shouldShow: state.sidebarOpen,
      isOverlay: false,
      collapsible: true,
    }
  }
  
  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Funciones principales
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    toggleTheme,
    setLoading,
    updatePreference,
    setPreferences,
    setPageSize,
    setEmpresas,
    setCurrentRoute,
    resetState,
    
    // Funciones de utilidad
    isMobile,
    isTablet,
    isDesktop,
    getBreakpoint,
    getSidebarConfig,
  }
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext