// src/pages/InventarioListar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/axiosConfig';

const InventarioSede = ({inventarios}) => {

  return (
    <div className="container mx-auto">
    <h2 className="text-xl font-medium mb-2">Inventario de la sede</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b">Marca</th>
              <th className="py-2 px-4 border-b">Modelo</th>
              <th className="py-2 px-4 border-b">Tipo de Artículo</th>
              <th className="py-2 px-4 border-b">Service Tag</th>
              <th className="py-2 px-4 border-b">Número de Serie</th>
            </tr>
          </thead>
          <tbody>
            {inventarios.map((inventario) => (
              <tr key={inventario.id_inventario} className="even:bg-gray-100">
                <td className="py-2 px-4 border-b">{inventario.marca}</td>
                <td className="py-2 px-4 border-b">{inventario.modelo}</td>
                <td className="py-2 px-4 border-b">{inventario.tipo_articulo}</td>
                <td className="py-2 px-4 border-b">{inventario.service_tag}</td>
                <td className="py-2 px-4 border-b">{inventario.num_serie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventarioSede;
