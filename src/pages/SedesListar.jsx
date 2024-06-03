// src/pages/SedesListar.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import { Link } from 'react-router-dom';
import ToggleSwitch from '../components/ToggleSwitch';
import './SedesListar.css';

const SedesListar = () => {
  const [sedes, setSedes] = useState([]);
  const [filteredSedes, setFilteredSedes] = useState([]);
  const [isMegatlon, setIsMegatlon] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:6060/sedes')
      .then(response => {
        setSedes(response.data);
        setFilteredSedes(response.data.filter(sede => sede.Empresa.nombre_empresa === 'Megatlon'));
      })
      .catch(error => {
        console.error('Error al obtener las sedes', error);
      });
  }, []);

  const handleToggle = () => {
    const newEmpresa = isMegatlon ? 'Fiter' : 'Megatlon';
    setIsMegatlon(!isMegatlon);
    setFilteredSedes(sedes.filter(sede => sede.Empresa.nombre_empresa === newEmpresa));
  };

  return (
    <div>
      <h2>Listar Sedes</h2>
      <div className="toggle-wrapper">
        <ToggleSwitch
          isMegatlon={isMegatlon}
          onToggle={handleToggle}
        />
      </div>
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-4">
        {filteredSedes.map((sede, index) => (
          <div
            key={index}
            className={`card ${isMegatlon ? 'bg-orange-100 hover-bg-orange-200' : 'bg-yellow-100 hover-bg-yellow-200'}`}
          >
            <h2 className={`text-lg font-medium ${isMegatlon ? 'text-orange-600' : 'text-yellow-600'}`}>
              {sede.nombre}
            </h2>
            <p className={`text-gray-500 ${isMegatlon ? 'text-orange-400' : 'text-yellow-400'}`}>
              {sede.network_Sede}
            </p>
            <div className="mt-2 flex justify-between items-center">
            <Link
                to={`/ver-sede/${sede.id_sede}`}
                className={`link ${isMegatlon ? 'bg-orange-500' : 'bg-yellow-500'}`}
              >
                Ver Sede
              </Link>
              <Link
                to={`/modificar-proveedor/${sede.id}`}
                className={`link bg-transparent border border-gray-900 text-gray-900 hover-bg-secondary-900 hover-text-white ${isMegatlon ? 'bg-orange-500' : 'bg-yellow-500'}`}
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
