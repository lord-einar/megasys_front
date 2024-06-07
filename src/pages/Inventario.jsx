// src/pages/Inventario.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import InventarioModal from '../components/InventarioModal';
import Pagination from '../components/Pagination';

const Inventario = () => {
  const [inventarios, setInventarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchInventarioDeposito();
  }, []);

  const fetchInventarioDeposito = async () => {
    try {
      const response = await axios.get('/inventario/bysede/d8bf1659-92d4-4d43-ba7f-e2b2d63e6fdc');
      setInventarios(response.data);
    } catch (error) {
      console.error('Error al obtener los inventarios', error);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchInventarioDeposito();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventarios.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Inventario disponible</h1>
      <button
        onClick={handleOpenModal}
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
      >
        Agregar al Inventario
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/12 py-2">Marca</th>
              <th className="w-1/12 py-2">Modelo</th>
              <th className="w-1/12 py-2">Tipo de Artículo</th>
              <th className="w-1/12 py-2">Service Tag</th>
              <th className="w-1/12 py-2">Número de Serie</th>
              <th className="w-1/12 py-2">Activo</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((inventario) => (
              <tr key={inventario.id_inventario} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{inventario.marca}</td>
                <td className="border px-4 py-2">{inventario.modelo}</td>
                <td className="border px-4 py-2">{inventario.tipo_articulo}</td>
                <td className="border px-4 py-2">{inventario.service_tag}</td>
                <td className="border px-4 py-2">{inventario.num_serie}</td>
                <td className="border px-4 py-2">{inventario.activo ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={inventarios.length}
        paginate={paginate}
        currentPage={currentPage}
      />
      {modalOpen && (
        <InventarioModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Inventario;
