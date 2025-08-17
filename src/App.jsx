// ============================================
// src/App.jsx
// Componente principal de la aplicación
// ============================================
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import AppRouter from './router'

function App() {
  const location = useLocation()
  const { setCurrentRoute } = useApp()
  
  // Actualizar ruta actual en el contexto
  useEffect(() => {
    setCurrentRoute(location.pathname)
  }, [location.pathname, setCurrentRoute])
  
  return (
    <div className="App">
      <AppRouter />
    </div>
  )
}

export default App