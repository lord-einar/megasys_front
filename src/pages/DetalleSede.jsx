// src/pages/DetalleSede.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/axiosConfig';
import InfoSede from '../components/InfoSede';
import './DetalleSede.css';
import PersonalSede from '../components/PersonalSede';
import ServiciosSede from '../components/ServiciosSede';
import InventarioSede from '../components/InventarioSede';

const DetalleSede = () => {
  const { id } = useParams();
  const [sede, setSede] = useState(null);
  const [personas, setPersonas] = useState(null);
  const [servicios, setServicios] = useState(null);
  const [inventarios, setInventarios] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:6060/sedes/id/${id}`)
      .then((response) => {
        setSede(response.data.sede);
        setPersonas(response.data.personas);
        setServicios(response.data.servicios);
        setInventarios(response.data.inventarios);
        console.log(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener la sede', error);
      });
  }, [id]);

  if (!sede) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="detalle-sede-container">
      <h2>{sede.nombre}</h2>
      <InfoSede sede={sede} />
      <PersonalSede personas={personas} />
      <ServiciosSede servicios={servicios} />
      <InventarioSede inventarios={inventarios} />
    </div>
  );
};

export default DetalleSede;
