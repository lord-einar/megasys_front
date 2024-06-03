// src/components/InfoSede.jsx
import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const InfoSede = ({ sede }) => (
  <Card className="mb-3">
    <Card.Header>Información de la Sede</Card.Header>
    <Card.Body>
      <ListGroup variant="flush">
        <ListGroup.Item><strong>Dirección:</strong> {sede.direccion}</ListGroup.Item>
        <ListGroup.Item><strong>Localidad:</strong> {sede.localidad}</ListGroup.Item>
        <ListGroup.Item><strong>Provincia:</strong> {sede.provincia}</ListGroup.Item>
        <ListGroup.Item><strong>País:</strong> {sede.pais}</ListGroup.Item>
        <ListGroup.Item><strong>Teléfono:</strong> {sede.telefono}</ListGroup.Item>
        <ListGroup.Item><strong>Email:</strong> {sede.email}</ListGroup.Item>
        <ListGroup.Item><strong>IP Asignada:</strong> {sede.ip_asignada}</ListGroup.Item>
        <ListGroup.Item><strong>Empresa:</strong> {sede.Empresa.nombre_empresa}</ListGroup.Item>
      </ListGroup>
    </Card.Body>
  </Card>
);

export default InfoSede;
