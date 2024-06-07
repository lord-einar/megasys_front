// src/pages/Sedes.jsx
import React, { useState, useEffect } from 'react';
import axios from '../services/axiosConfig';
import SedesModal from '../components/SedesModal';
import ToggleSwitch from '../components/ToggleSwitch';
import Card from '../components/Card';

const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState(null);
  const [isMegatlon, setIsMegatlon] = useState(true);

  useEffect(() => {
    fetchSedes();
  }, [isMegatlon]);

  const fetchSedes = async () => {
    try {
      const response = await axios.get('/sedes');
      const filteredSedes = response.data.filter(sede =>
        isMegatlon ? sede.Empresa.nombre === 'Megatlon' : sede.Empresa.nombre === 'Fiter'
      );
      setSedes(filteredSedes);
    } catch (error) {
      console.error('Error al obtener las sedes', error);
    }
  };

  const handleOpenModal = (sede = null) => {
    setSelectedSede(sede);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSede(null);
    setModalOpen(false);
    fetchSedes();
  };

  const handleToggle = () => {
    setIsMegatlon(prevState => !prevState);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Sedes</h1>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Crear Sede
        </button>
        <ToggleSwitch
          isChecked={!isMegatlon}
          onChange={handleToggle}
          label1="Megatlon"
          label2="Fiter"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sedes.map(sede => (
          <Card
            key={sede.id_sede}
            sede={sede}
            isMegatlon={isMegatlon}
            onEdit={handleOpenModal}
          />
        ))}
      </div>
      {modalOpen && (
        <SedesModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          sede={selectedSede}
        />
      )}
    </div>
  );
};

export default Sedes;
