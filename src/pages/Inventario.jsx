import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import InventarioDisponible from '../components/InventarioDisponible';
import EquiposPrestamo from '../components/EquiposPrestamo';
import Pagination from '../components/Pagination';
import InventarioModal from '../components/InventarioModal';
import RemitoViewModal from '../components/RemitoViewModal';

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
    const response = await axios.get('/inventario/bysede/d8bf1659-92d4-4d43-ba7f-e2b2d63e6fdc');
    setInventarios(response.data);
  };

  const fetchEquiposEnPrestamo = async () => {
    const response = await axios.get('/remitos/prestamos');
    setPrestamos(response.data);
    console.log(response.data)
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    fetchInventarioDeposito();
  };

  const handleViewRemito = (item) => {
    console.log(item)
    setSelectedRemito(item);
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
      {!showPrestamos ? (
        <InventarioDisponible inventarios={currentItems} />
      ) : (
        <EquiposPrestamo prestamos={currentItems} onViewRemito={handleViewRemito} />
      )}
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
