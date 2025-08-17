// src/App.jsx
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import AppRouter from './router'

export default function App() {
  const location = useLocation()
  const { setCurrentRoute } = useApp()

  useEffect(() => {
    // solo depende del pathname; no incluyas la función
    setCurrentRoute(location.pathname)
  }, [location.pathname])

  return (
    <div className="App">
      <AppRouter />
    </div>
  )
}
