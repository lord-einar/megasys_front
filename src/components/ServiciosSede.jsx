// src/components/ServiciosSede.jsx
import React from "react";

const ServiciosSede = ({ servicios }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-xl font-medium mb-2">Servicios Asociados</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b">Servicio</th>
              <th className="py-2 px-4 border-b">Proveedor</th>
              <th className="py-2 px-4 border-b">Contacto</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {(servicios) ? servicios.map((servicio, index) => (
              <tr key={index} className="even:bg-gray-100">
                <td className="py-2 px-4 border-b">
                  {servicio.Servicio.nombre}
                </td>
                <td className="py-2 px-4 border-b">
                  {servicio.Proveedor.nombre}
                </td>
                <td className="py-2 px-4 border-b">
                  {servicio.Proveedor.nombre_ejecutivo}
                </td>
                <td className="py-2 px-4 border-b">
                  {servicio.Proveedor.email_ejecutivo}
                </td>
                <td className="py-2 px-4 border-b">
                  {servicio.Proveedor.telefono_soporte_1}
                </td>
              </tr>
            )) : <p>"No hay servicios asociados</p>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiciosSede;
