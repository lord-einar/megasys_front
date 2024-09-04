import React from 'react';

const InventarioDisponible = ({ inventarios }) => {
  return (
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
        {inventarios.map((item) => (
          <tr key={item.id_inventario} className="hover:bg-gray-100">
            <td className="border px-4 py-2">{item.Marca.nombre}</td>
            <td className="border px-4 py-2">{item.modelo}</td>
            <td className="border px-4 py-2">{item.tipo_articulo.nombre}</td>
            <td className="border px-4 py-2">{item.service_tag}</td>
            <td className="border px-4 py-2">{item.num_serie}</td>
            <td className="border px-4 py-2">{item.activo ? 'Sí' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventarioDisponible;
