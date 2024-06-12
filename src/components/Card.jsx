// src/components/Card.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ sede, isMegatlon, onEdit }) => (
  <div
    key={sede.id_sede}
    className={`p-4 border rounded-lg cursor-pointer transition-colors ${isMegatlon ? 'bg-orange-100 hover:bg-orange-200' : 'bg-yellow-100 hover:bg-yellow-200'}`}
  >
    <h2 className={`text-lg font-medium ${isMegatlon ? 'text-orange-600' : 'text-yellow-600'}`}>{sede.nombre}</h2>
    <div className="mt-2 flex justify-between items-center">
      <Link
        to={`/ver-sede/${sede.id_sede}`}
        className={`py-1 px-4 hover:bg-secondary-900 transition-colors text-white rounded ${isMegatlon ? 'bg-orange-500' : 'bg-yellow-500'}`}
      >
        Ver Sede
      </Link>
      <button
        onClick={() => onEdit(sede)}
        className={`py-1 px-4 hover:bg-secondary-900 transition-colors text-white rounded ${isMegatlon ? 'bg-orange-500' : 'bg-yellow-500'}`}
      >
        Modificar
      </button>
    </div>
  </div>
);

export default Card;
