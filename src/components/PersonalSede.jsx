// src/components/PersonasAsociadas.jsx
import React from 'react';
import { Card, Table } from 'react-bootstrap';

const PersonalSede = ({ personas }) => (
  <Card className="mb-3">
    <Card.Header>Personas Asociadas</Card.Header>
    <Card.Body>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {personas.map((persona, index) => (
            <tr key={index}>
              <td>{persona.Persona.nombre}</td>
              <td>{persona.Persona.email}</td>
              <td>{persona.Persona.telefono}</td>
              <td>{persona.Rol.nombre}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

export default PersonalSede;
