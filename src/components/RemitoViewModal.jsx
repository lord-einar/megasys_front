// src/components/RemitoViewModal.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const RemitoViewModal = ({ isOpen, onClose, remito = null, id_remito=null }) => {
  const [equipos, setEquipos] = useState([]);

  console.log(remito)

  const getRemito = async() => {
    const remitofull = await axios.get(`/remitos/${id_remito}`)
      console.log(remitofull)
      setEquipos(remitofull.inventario);
  }

  useEffect(() => {
    (!remito) ? getRemito() : setEquipos(remito)
  }, [remito]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">Ver Remito</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sede</label>
            <p>{remito.sede_nombre}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Solicitante</label>
            <p>{remito.solicitante}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <p>{new Date(remito.fecha_remito).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Transportista</label>
            <p>{remito.transportista}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Equipos Asociados</h3>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">Marca</th>
                <th className="py-2">Modelo</th>
                <th className="py-2">Tipo de Artículo</th>
                <th className="py-2">Préstamo</th>
              </tr>
            </thead>
            <tbody>
              {(equipos.inventarios) && equipos.inventarios.map((equipo, index) => (
                <tr key={index}>
                  <td className="py-2">{equipo.marca}</td>
                  <td className="py-2">{equipo.modelo}</td>
                  <td className="py-2">{equipo.tipo_articulo}</td>
                  <td className="py-2">{equipo.es_prestamo ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemitoViewModal;
