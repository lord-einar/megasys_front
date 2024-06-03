// src/pages/Dashboard.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <Container fluid>
      <h2>Bienvenido, [Nombre del Usuario]</h2>
      <Row className="mb-3">
        <Col xs={12} md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Sedes</Card.Title>
              <Card.Text>
                10
                <span className="text-success"> +5% Desde la semana pasada</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Inventarios</Card.Title>
              <Card.Text>
                200
                <span className="text-danger"> -2% Desde la semana pasada</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Proveedores</Card.Title>
              <Card.Text>
                50
                <span className="text-success"> +1% Desde la semana pasada</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Remitos</Card.Title>
              <Card.Text>
                100
                <span className="text-success"> +3% Desde la semana pasada</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Estadísticas de Inventario</Card.Title>
              {/* Aquí puedes agregar un gráfico similar al de la imagen */}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Estadísticas de Proveedores</Card.Title>
              {/* Aquí puedes agregar un gráfico similar al de la imagen */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
