// src/components/InventariosAsociados.jsx
import React from 'react';
import { Card, Table } from 'react-bootstrap';

const InventarioSede = ({ inventarios }) => (
  <Card className="mb-3">
    <Card.Header>Inventarios Asociados</Card.Header>
    <Card.Body>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Tipo de Artículo</th>
            <th>Service Tag</th>
            <th>Número de Serie</th>
            <th>Es Préstamo</th>
          </tr>
        </thead>
        <tbody>
          {inventarios.map((inventario, index) => (
            <tr key={index}>
              <td>{inventario.marca}</td>
              <td>{inventario.modelo}</td>
              <td>{inventario.tipo_articulo}</td>
              <td>{inventario.service_tag}</td>
              <td>{inventario.num_serie}</td>
              <td>{inventario.es_prestamo ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

export default InventarioSede;
