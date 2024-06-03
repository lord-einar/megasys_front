// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SedesListar from "./pages/SedesListar";
import SedesCrear from "./pages/SedesCrear";
import InventarioListar from "./pages/InventarioListar";
import InventarioCrear from "./pages/InventarioCrear";
import ProveedorListar from "./pages/ProveedorListar";
import ProveedorCrear from "./pages/ProveedorCrear";
import RemitoListar from "./pages/RemitoListar";
import RemitoCrear from "./pages/RemitoCrear";
import DetalleSede from "./pages/DetalleSede";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Row>
        <Button
          className="d-md-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            zIndex: 1000,
          }}
        >
          ☰
        </Button>

        <Col lg={2}>
          <div
            className={`sidebar ${
              sidebarOpen ? "d-block" : "d-none"
            } d-md-block`}
          >
            <Sidebar />
          </div>
        </Col>
        <Col lg={10}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sede/listar" element={<SedesListar />} />
            <Route path="/sede/crear" element={<SedesCrear />} />
            <Route path="/ver-sede/:id" element={<DetalleSede />} />
            <Route path="/inventario/listar" element={<InventarioListar />} />
            <Route path="/inventario/crear" element={<InventarioCrear />} />
            <Route path="/proveedor/listar" element={<ProveedorListar />} />
            <Route path="/proveedor/crear" element={<ProveedorCrear />} />
            <Route path="/remito/listar" element={<RemitoListar />} />
            <Route path="/remito/crear" element={<RemitoCrear />} />
          </Routes>
        </Col>
      </Row>
    </Router>
  );
}

export default App;
