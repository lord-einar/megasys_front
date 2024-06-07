// src/components/PersonalSede.jsx
import React from 'react';

const PersonalSede = ({ personas }) => {
  console.log(personas)

  return (
  <div className="bg-white p-4 rounded-lg shadow mb-4">
    <h2 className="text-xl font-medium mb-2">Personas Asociadas</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">Nombre</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Teléfono</th>
            <th className="py-2 px-4 border-b">Rol</th>
          </tr>
        </thead>
        <tbody>
          {(personas) ? personas.map((persona, index) => (
            <tr key={index} className="even:bg-gray-100">
              <td className="py-2 px-4 border-b">{persona.Persona.nombre}</td>
              <td className="py-2 px-4 border-b">{persona.Persona.email}</td>
              <td className="py-2 px-4 border-b">{persona.Persona.telefono}</td>
              <td className="py-2 px-4 border-b">{persona.Rol.nombre}</td>
            </tr>
          )): <p>"No hay personal"</p>}
        </tbody>
      </table>
    </div>
  </div>
  )
};

export default PersonalSede;
