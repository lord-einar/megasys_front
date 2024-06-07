// src/pages/SedesListar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/axiosConfig';

const SedesListar = () => {
  const [sedes, setSedes] = useState([]);
  const [isMegatlon, setIsMegatlon] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:6060/sedes')
      .then(response => {
        setSedes(response.data);
      })
      .catch(error => {
        console.error('Error al obtener las sedes', error);
      });
  }, []);

  const handleToggle = () => {
    setIsMegatlon(!isMegatlon);
  };

  const SedesAMostrar = isMegatlon
    ? sedes.filter(sede => sede.Empresa.nombre === "Megatlon")
    : sedes.filter(sede => sede.Empresa.nombre === "Fiter");

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Listar Sedes</h1>
      <label className="relative inline-flex items-center cursor-pointer mb-4">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={!isMegatlon}
          onChange={handleToggle}
        />
        <div className={`w-11 h-6 bg-black rounded-full peer-checked:bg-cyan-500`}>
          <div className={`absolute top-0.5 left-[2px] border border-gray-300 rounded-full h-5 w-5 transition-all ${isMegatlon ? "bg-orange-500" : "bg-yellow-200 translate-x-full border-white"}`}></div>
        </div>
        <span className={`ml-3 text-sm font-medium ${isMegatlon ? "text-orange-500" : "text-yellow-200"}`}>
          {isMegatlon ? "Megatlon" : "Fiter"}
        </span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SedesAMostrar.map((sede, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${isMegatlon ? "bg-orange-100 hover:bg-orange-200" : "bg-yellow-100 hover:bg-yellow-200"}`}
          >
            <h2 className={`text-lg font-medium ${isMegatlon ? "text-orange-600" : "text-yellow-600"}`}>
              {sede.nombre}
            </h2>
            <p className={`text-gray-500 ${isMegatlon ? "text-orange-400" : "text-yellow-400"}`}>
              {sede.network_Sede}
            </p>
            <div className="mt-2 flex justify-between items-center">
              <Link
                to={`/ver-sede/${sede.id_sede}`}
                className={`py-1 px-4 hover:bg-secondary-900 transition-colors text-white rounded ${isMegatlon ? "bg-orange-500" : "bg-yellow-500"}`}
              >
                Ver Sede
              </Link>
              <Link
                to={`/modificar-sede/${sede.id_sede}`}
                className={`py-1 px-4 bg-transparent border border-gray-900 text-gray-900 hover:bg-secondary-900 transition-colors hover:text-white rounded ${isMegatlon ? "bg-orange-500" : "bg-yellow-500"}`}
              >
                Modificar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SedesListar;
