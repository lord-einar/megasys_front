// src/components/Sidebar.jsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaBuilding, FaClipboardList, FaBox, FaTruck } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <Nav className="col-md-2 d-md-block bg-dark sidebar" activeKey="/home">
      <div className="sidebar-sticky"></div>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaBuilding className="me-2" />
        <LinkContainer to="/sede/listar">
          <Nav.Link className="text-white p-0">Listar Sedes</Nav.Link>
        </LinkContainer>
      </Nav.Item>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaBuilding className="me-2" />
        <LinkContainer to="/sede/crear">
          <Nav.Link className="text-white p-0">Crear Sede</Nav.Link>
        </LinkContainer>
      </Nav.Item>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaClipboardList className="me-2" />
        <LinkContainer to="/inventario/listar">
          <Nav.Link className="text-white p-0">Listar Inventarios</Nav.Link>
        </LinkContainer>
      </Nav.Item>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaClipboardList className="me-2" />
        <LinkContainer to="/inventario/crear">
          <Nav.Link className="text-white p-0">Crear Inventario</Nav.Link>
        </LinkContainer>
      </Nav.Item>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaBox className="me-2" />
        <LinkContainer to="/proveedor/listar">
          <Nav.Link className="text-white p-0">Listar Proveedores</Nav.Link>
        </LinkContainer>
      </Nav.Item>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaBox className="me-2" />
        <LinkContainer to="/proveedor/crear">
          <Nav.Link className="text-white p-0">Crear Proveedor</Nav.Link>
        </LinkContainer>
      </Nav.Item>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaTruck className="me-2" />
        <LinkContainer to="/remito/listar">
          <Nav.Link className="text-white p-0">Listar Remitos</Nav.Link>
        </LinkContainer>
      </Nav.Item>
      <Nav.Item className="text-white py-2 d-flex align-items-center">
        <FaTruck className="me-2" />
        <LinkContainer to="/remito/crear">
          <Nav.Link className="text-white p-0">Crear Remito</Nav.Link>
        </LinkContainer>
      </Nav.Item>
    </Nav>
  );
};

export default Sidebar;
