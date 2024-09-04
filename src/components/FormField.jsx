// src/components/FormField.jsx
import React from 'react';

const FormField = ({ label, name, register, errors, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      {...register(name)}
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
    {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>}
  </div>
);

export default FormField;
