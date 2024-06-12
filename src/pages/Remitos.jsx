// src/pages/Remitos.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import RemitoModal from '../components/RemitoModal';
import RemitoViewModal from '../components/RemitoViewModal';
import Pagination from '../components/Pagination';

const Remitos = () => {
  const [remitos, setRemitos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRemitos = async () => {
    try {
      const response = await axios.get('/remitos');
      setRemitos(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error al obtener los remitos', error);
    }
  };

  useEffect(() => {
    fetchRemitos();
  }, []);

  const handleView = (remito) => {
    setSelectedRemito(remito);
    setViewModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedRemito(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setViewModalOpen(false);
    fetchRemitos();
  };

  const paginatedRemitos = remitos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Remitos</h1>
      <button onClick={handleCreate} className="bg-blue-500 text-white py-2 px-4 rounded mb-4">Nuevo Remito</button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">N°</th>
            <th className="py-2">Sede</th>
            <th className="py-2">Solicitante</th>
            <th className="py-2">Fecha</th>
            <th className="py-2">Transportista</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRemitos.map((remito) => (
            <tr key={remito.id_remito}>
              <td className="py-2">{remito.id_remito}</td>
              <td className="py-2">{remito.sede_nombre}</td>
              <td className="py-2">{remito.solicitante}</td>
              <td className="py-2">{new Date(remito.fecha_remito).toLocaleDateString()}</td>
              <td className="py-2">{remito.transportista}</td>
              <td className="py-2">
                <button onClick={() => handleView(remito)} className="bg-gray-500 text-white py-1 px-2 rounded">Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={currentPage}
        totalItems={remitos.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
      {modalOpen && (
        <RemitoModal
          isOpen={modalOpen}
          onClose={handleClose}
          remito={selectedRemito}
        />
      )}
      {viewModalOpen && (
        <RemitoViewModal
          isOpen={viewModalOpen}
          onClose={handleClose}
          remito={selectedRemito}
        />
      )}
    </div>
  );
};

export default Remitos;
