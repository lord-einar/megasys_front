// src/components/ServiciosAsociados.jsx
import React from 'react';
import { Card, Table } from 'react-bootstrap';

const ServiciosSede = ({ servicios }) => (
  <Card className="mb-3">
    <Card.Header>Servicios Asociados</Card.Header>
    <Card.Body>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Proveedor</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio, index) => (
            <tr key={index}>
              <td>{servicio.Servicio.nombre}</td>
              <td>{servicio.Proveedor.nombre}</td>
              <td>{servicio.Proveedor.nombre_ejecutivo}</td>
              <td>{servicio.Proveedor.email_ejecutivo}</td>
              <td>{servicio.Proveedor.telefono_soporte_1}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

export default ServiciosSede;
