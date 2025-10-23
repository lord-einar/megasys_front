import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import SedesPage from './pages/SedesPage'
import SedeDetallePage from './pages/SedeDetallePage'
import NuevaSede from './pages/NuevaSede'
import PersonalPage from './pages/PersonalPage'
import NuevoPersonal from './pages/NuevoPersonal'
import InventarioPage from './pages/InventarioPage'
import { useAuth } from './contexts/AuthContext'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  }

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <Header
                onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
              />

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Sedes routes - más específicas primero */}
                  <Route path="/sedes/nueva" element={<NuevaSede />} />
                  <Route path="/sedes/:id" element={<SedeDetallePage />} />
                  <Route path="/sedes" element={<SedesPage />} />

                  {/* Personal routes - más específicas primero */}
                  <Route path="/personal/crear" element={<NuevoPersonal />} />
                  <Route path="/personal" element={<PersonalPage />} />

                  <Route path="/inventario" element={<InventarioPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
