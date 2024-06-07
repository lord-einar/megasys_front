// src/pages/SedesCrear.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '../services/axiosConfig';
import Swal from 'sweetalert2';

const schema = yup.object().shape({
  id_empresa: yup.string().required('La empresa es obligatoria'),
  nombre: yup.string().required('El nombre es obligatorio'),
  direccion: yup.string().required('La dirección es obligatoria'),
  localidad: yup.string().required('La localidad es obligatoria'),
  provincia: yup.string().required('La provincia es obligatoria'),
  pais: yup.string().required('El país es obligatorio'),
  telefono: yup.string().required('El teléfono es obligatorio'),
  email: yup.string().email('Debe ser un email válido').required('El email es obligatorio'),
  ip_asignada: yup.string().required('La IP asignada es obligatoria'),
});

const SedesCrear = () => {
  const [empresas, setEmpresas] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = data => {
    Swal.fire({
      title: 'Enviando...',
      text: 'Por favor, espera mientras enviamos la información',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    axios.post('http://localhost:6060/sedes', data)
      .then(response => {
        Swal.fire({
          title: 'Éxito',
          text: 'La sede ha sido creada correctamente',
          icon: 'success'
        });
        reset();
      })
      .catch(error => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear la sede',
          icon: 'error'
        });
        console.error('Error al crear la sede', error);
      });
  };

  useEffect(() => {
    axios.get('http://localhost:6060/empresa')
      .then(response => {
        console.log(response.data);
        setEmpresas(response.data);
      })
      .catch(error => {
        console.log("Error al obtener las empresas: ", error);
      });
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Crear Sede</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-200 p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4 p-5">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              {...register('nombre')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              {...register('direccion')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Localidad</label>
            <input
              type="text"
              {...register('localidad')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.localidad && <p className="text-red-500 text-sm mt-1">{errors.localidad.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Provincia</label>
            <input
              type="text"
              {...register('provincia')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.provincia && <p className="text-red-500 text-sm mt-1">{errors.provincia.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">País</label>
            <input
              type="text"
              {...register('pais')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.pais && <p className="text-red-500 text-sm mt-1">{errors.pais.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="text"
              {...register('telefono')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IP Asignada</label>
            <input
              type="text"
              {...register('ip_asignada')}
              className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.ip_asignada && <p className="text-red-500 text-sm mt-1">{errors.ip_asignada.message}</p>}
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Crear Sede
        </button>
      </form>
    </div>
  );
};

export default SedesCrear;
