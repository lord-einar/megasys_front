// src/pages/Inventario.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import InventarioModal from '../components/InventarioModal';
import RemitoViewModal from '../components/RemitoViewModal';
import Pagination from '../components/Pagination';

const Inventario = () => {
  const [inventarios, setInventarios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [showPrestamos, setShowPrestamos] = useState(false);

  useEffect(() => {
    fetchInventarioDeposito();
    fetchEquiposEnPrestamo();
  }, []);

  const fetchInventarioDeposito = async () => {
    try {
      const response = await axios.get('/inventario/bysede/d8bf1659-92d4-4d43-ba7f-e2b2d63e6fdc');
      setInventarios(response.data);
    } catch (error) {
      console.error('Error al obtener los inventarios', error);
    }
  };

  const fetchEquiposEnPrestamo = async () => {
    try {
      const response = await axios.get('/remitos/prestamos');
      setPrestamos(response.data);
    } catch (error) {
      console.error('Error al obtener los equipos en préstamo', error);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchInventarioDeposito();
  };

  const handleViewRemito = (remito) => {
    setSelectedRemito(remito);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedRemito(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = showPrestamos ? prestamos.slice(indexOfFirstItem, indexOfLastItem) : inventarios.slice(indexOfFirstItem, indexOfLastItem);

  console.log(currentItems)
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">{showPrestamos ? 'Equipos en Préstamo' : 'Inventario disponible'}</h1>
      <button
        onClick={() => setShowPrestamos(!showPrestamos)}
        className="bg-gray-500 text-white py-2 px-4 rounded mb-4"
      >
        {showPrestamos ? 'Ver Inventario Disponible' : 'Ver Equipos en Préstamo'}
      </button>
      {!showPrestamos && (
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          Agregar al Inventario
        </button>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/12 py-2">Marca</th>
              <th className="w-1/12 py-2">Modelo</th>
              <th className="w-1/12 py-2">Tipo de Artículo</th>
              <th className="w-1/12 py-2">Service Tag</th>
              <th className="w-1/12 py-2">Número de Serie</th>
              {showPrestamos ? (
                <>
                  <th className="w-1/12 py-2">Solicitante</th>
                  <th className="w-1/12 py-2">Fecha Remito</th>
                  <th className="w-1/12 py-2">Transportista</th>
                  <th className="w-1/12 py-2">Acciones</th>
                </>
              ) : (
                <th className="w-1/12 py-2">Activo</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id_inventario || item.id_remito} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{item.Inventario?.marca || item.marca}</td>
                <td className="border px-4 py-2">{item.Inventario?.modelo || item.modelo}</td>
                <td className="border px-4 py-2">{item.Inventario?.tipo_articulo || item.tipo_articulo}</td>
                <td className="border px-4 py-2">{item.Inventario?.service_tag || item.service_tag}</td>
                <td className="border px-4 py-2">{item.Inventario?.num_serie || item.num_serie}</td>
                {showPrestamos ? (
                  <>
                    <td className="border px-4 py-2">{item.Remito.solicitante}</td>
                    <td className="border px-4 py-2">{new Date(item.Remito.fecha_remito).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{item.Remito.transportista}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleViewRemito(item.Remito)}
                        className="bg-gray-500 text-white py-1 px-2 rounded"
                      >
                        Ver Remito
                      </button>
                    </td>
                  </>
                ) : (
                  <td className="border px-4 py-2">{item.activo ? 'Sí' : 'No'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={showPrestamos ? prestamos.length : inventarios.length}
        paginate={paginate}
        currentPage={currentPage}
      />
      {modalOpen && (
        <InventarioModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
        />
      )}
      {viewModalOpen && selectedRemito && (
        <RemitoViewModal
          isOpen={viewModalOpen}
          onClose={handleCloseViewModal}
          remito={selectedRemito}
        />
      )}
    </div>
  );
};

export default Inventario;
