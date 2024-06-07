// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SedesListar from './pages/SedesListar';
import SedesCrear from './pages/SedesCrear';
import DetalleSede from './pages/DetalleSede';
import ProveedorListar from './pages/ProveedorListar';
import ProveedorCrear from './pages/ProveedorCrear';
import PersonasCrear from './pages/PersonasCrear';
import SedesModificar from './pages/SedesModificar';
import Personal from './pages/Personal';
import Sedes from './pages/Sedes';
import Inventario from './pages/Inventario';
import Remitos from './pages/Remitos';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen">
        <button
          className="md:hidden fixed top-4 left-4 z-50 text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 p-10 md:ml-6 bg-gray-100">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sede/listar" element={<SedesListar />} />
            <Route path="/sede/crear" element={<SedesCrear />} />
            <Route path="/sedes" element={<Sedes />} /> {/* Nueva ruta para Sedes */}
            <Route path="/modificar-sede/:id" element={<SedesModificar />} />
            <Route path="/ver-sede/:id" element={<DetalleSede />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/proveedor/listar" element={<ProveedorListar />} />
            <Route path="/proveedor/crear" element={<ProveedorCrear />} />
            <Route path="/personal/crear" element={<PersonasCrear />} />
            <Route path="/remitos" element={<Remitos />} />
            <Route path="/personal" element={<Personal />} /> {/* Nueva ruta para Personal */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
