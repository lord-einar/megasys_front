// src/components/EmpresaSelect.jsx
import React from 'react';

const EmpresaSelect = ({ register, errors, empresas }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">Empresa</label>
    <select 
      {...register('id_empresa')} 
      className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
    >
      <option value="">--Seleccione la empresa--</option>
      {empresas.map(empresa => (
        <option key={empresa.id_empresa} value={empresa.id_empresa}>{empresa.nombre}</option>
      ))}
    </select>
    {errors.id_empresa && <p className="text-red-500 text-sm mt-1">{errors.id_empresa.message}</p>}
  </div>
);

export default EmpresaSelect;
