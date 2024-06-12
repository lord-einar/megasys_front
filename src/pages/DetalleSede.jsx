// src/pages/DetalleSede.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../services/axiosConfig";
import Tabs from "../components/Tabs";

const DetalleSede = () => {
  const { id } = useParams();
  const [sede, setSede] = useState(null);
  const [personas, setPersonas] = useState(null);
  const [servicios, setServicios] = useState(null);
  const [inventarios, setInventarios] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:6060/sedes/id/${id}`)
      .then((response) => {
        console.log(response.data);
        setSede(response.data);
        setPersonas(response.data.personas);
        setServicios(response.data.servicios);
        setInventarios(response.data.inventarios);
      })
      .catch((error) => {
        console.error("Error al obtener la sede", error);
      });
  }, [id]);

  if (!sede) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">{sede.sede.nombre}</h1>
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl text-white font-medium mb-2 bg-gray-500 p-2 rounded-t-lg">Información de la Sede</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-b p-2">
            <strong>Dirección:</strong> {sede.sede.direccion}
          </div>
          <div className="border-b p-2">
            <strong>Localidad:</strong> {sede.sede.localidad}
          </div>
          <div className="border-b p-2">
            <strong>Provincia:</strong> {sede.sede.provincia}
          </div>
          <div className="border-b p-2">
            <strong>País:</strong> {sede.sede.pais}
          </div>
          <div className="border-b p-2">
            <strong>Teléfono:</strong> {sede.sede.telefono}
          </div>
          <div className="border-b p-2">
            <strong>Email:</strong> {sede.sede.email}
          </div>
          <div className="border-b p-2">
            <strong>IP Asignada:</strong> {sede.sede.ip_asignada}
          </div>
          <div className="border-b p-2">
            <strong>Empresa:</strong> {sede.sede.Empresa.nombre}
          </div>
        </div>
      </div>

      <Tabs
        personas={personas}
        servicios={servicios}
        inventarios={inventarios}
      />
    </div>
  );
};

export default DetalleSede;
