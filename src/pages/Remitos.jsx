// src/pages/Remitos.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import RemitoModal from '../components/RemitoModal';
import Pagination from '../components/Pagination';

const Remitos = () => {
  const [remitos, setRemitos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchRemitos();
  }, []);

  const fetchRemitos = async () => {
    try {
      const response = await axios.get('/remitos');
      setRemitos(response.data);
    } catch (error) {
      console.error('Error al obtener los remitos', error);
    }
  };

  const handleOpenModal = () => {
    setSelectedRemito(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchRemitos();
  };

  const handleViewRemito = (remito) => {
    setSelectedRemito(remito);
    setModalOpen(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = remitos.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Remitos</h1>
      <button
        onClick={handleOpenModal}
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
      >
        Nuevo Remito
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/12 py-2">ID Remito</th>
              <th className="w-1/12 py-2">Sede</th>
              <th className="w-1/12 py-2">Solicitante</th>
              <th className="w-1/12 py-2">Fecha</th>
              <th className="w-1/12 py-2">Transportista</th>
              <th className="w-1/12 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((remito) => (
              <tr key={remito.id_remito} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{remito.id_remito}</td>
                <td className="border px-4 py-2">{remito.Sede.nombre}</td>
                <td className="border px-4 py-2">{remito.solicitante}</td>
                <td className="border px-4 py-2">{new Date(remito.fecha_remito).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{remito.transportista}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleViewRemito(remito)}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                  >
                    Ver Remito
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={remitos.length}
        paginate={paginate}
        currentPage={currentPage}
      />
      {modalOpen && (
        <RemitoModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          remito={selectedRemito}
        />
      )}
    </div>
  );
};

export default Remitos;
