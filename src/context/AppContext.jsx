// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { APP_CONFIG } from '../services/config'

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  loading: false,
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pageSize: APP_CONFIG.DEFAULT_PAGE_SIZE,
  preferences: { notifications: true, autoRefresh: true, compactMode: false },
  empresas: [],
  currentRoute: '/',
}

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

function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.payload }
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen }
    case APP_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload }
    case APP_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case APP_ACTIONS.SET_ONLINE:
      return { ...state, online: action.payload }
    case APP_ACTIONS.SET_PAGE_SIZE:
      return { ...state, pageSize: action.payload }
    case APP_ACTIONS.SET_PREFERENCES:
      return { ...state, preferences: action.payload }
    case APP_ACTIONS.UPDATE_PREFERENCE:
      return {
        ...state,
        preferences: { ...state.preferences, [action.payload.key]: action.payload.value },
      }
    case APP_ACTIONS.SET_EMPRESAS:
      return { ...state, empresas: action.payload }
    case APP_ACTIONS.SET_CURRENT_ROUTE:
      return { ...state, currentRoute: action.payload }
    case APP_ACTIONS.RESET_STATE:
      return initialState
    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // --- actions ---
  const setSidebarOpen = useCallback((open) => dispatch({ type: APP_ACTIONS.SET_SIDEBAR_OPEN, payload: open }), [])
  const toggleSidebar = useCallback(() => dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR }), [])
  const setTheme = useCallback((theme) => dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme }), [])
  const setLoading = useCallback((val) => dispatch({ type: APP_ACTIONS.SET_LOADING, payload: val }), [])
  const setOnline = useCallback((val) => dispatch({ type: APP_ACTIONS.SET_ONLINE, payload: val }), [])
  const setPageSize = useCallback((ps) => dispatch({ type: APP_ACTIONS.SET_PAGE_SIZE, payload: ps }), [])
  const setPreferences = useCallback((prefs) => dispatch({ type: APP_ACTIONS.SET_PREFERENCES, payload: prefs }), [])
  const updatePreference = useCallback(
    (key, value) => dispatch({ type: APP_ACTIONS.UPDATE_PREFERENCE, payload: { key, value } }),
    []
  )
  const setEmpresas = useCallback((empresas) => dispatch({ type: APP_ACTIONS.SET_EMPRESAS, payload: empresas }), [])
  const setCurrentRoute = useCallback((route) => dispatch({ type: APP_ACTIONS.SET_CURRENT_ROUTE, payload: route }), [])

  // --- listeners ---
  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setOnline])

  // --- helpers UI (breakpoints + sidebar config) ---
  const isMobile = useCallback(() => window.matchMedia('(max-width: 640px)').matches, [])
  const isTablet = useCallback(() => window.matchMedia('(min-width: 641px) and (max-width: 1024px)').matches, [])
  const isDesktop = useCallback(() => window.matchMedia('(min-width: 1025px)').matches, [])

  const getBreakpoint = useCallback(() => {
    if (isMobile()) return 'mobile'
    if (isTablet()) return 'tablet'
    return 'desktop'
  }, [isMobile, isTablet])

  const getSidebarConfig = useCallback(() => {
    const bp = getBreakpoint()
    if (bp === 'mobile') {
      return { shouldShow: state.sidebarOpen, isOverlay: true, collapsible: true }
    }
    if (bp === 'tablet') {
      return { shouldShow: state.sidebarOpen, isOverlay: false, collapsible: true }
    }
    // desktop
    return { shouldShow: state.sidebarOpen, isOverlay: false, collapsible: true }
  }, [getBreakpoint, state.sidebarOpen])

  const value = useMemo(
    () => ({
      ...state,
      // actions
      setSidebarOpen,
      toggleSidebar,
      setTheme,
      setLoading,
      setOnline,
      setPageSize,
      setPreferences,
      updatePreference,
      setEmpresas,
      setCurrentRoute,
      // helpers
      isMobile,
      isTablet,
      isDesktop,
      getBreakpoint,
      getSidebarConfig,
    }),
    [
      state,
      setSidebarOpen,
      toggleSidebar,
      setTheme,
      setLoading,
      setOnline,
      setPageSize,
      setPreferences,
      updatePreference,
      setEmpresas,
      setCurrentRoute,
      isMobile,
      isTablet,
      isDesktop,
      getBreakpoint,
      getSidebarConfig,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
