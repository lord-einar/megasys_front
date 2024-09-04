// src/components/InventarioModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from '../services/axiosConfig';
import { inventarioSchema } from '../utils/validationSchemas';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';

const InventarioModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(inventarioSchema),
  });
  const [idDeposito, setIdDeposito] = useState(null);
  const [tipoArticulo, setTipoArticulo] = useState([]);
  const [marcas, setMarcas] = useState([]);

  useEffect(() => {
    const fetchDepositoId = async () => {
      try {
        const response = await axios.get('/sedes');
        const deposito = response.data.find(sede => sede.nombre === 'Depósito');
        setIdDeposito(deposito ? deposito.id_sede : null);
      } catch (error) {
        console.error('Error al obtener el ID de Depósito', error);
      }
    };

    const fetchTipoArticulo = async () => {
      try {
        const response = await axios.get('/tipo_articulo');
        setTipoArticulo(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error al obtener los tipos de artículos', error);
      }
    };

    const fetchMarcas = async () => {
      try {
        const response = await axios.get('/marcas');
        setMarcas(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error al obtener las marcas', error);
      }
    };

    fetchDepositoId();
    fetchTipoArticulo();
    fetchMarcas();
  }, []);

  const onSubmit = async (data) => {
    console.log(data);
    if (!idDeposito) {
      showErrorAlert('No se pudo encontrar el ID de la sede "Depósito".');
      return;
    }

    data.id_sede = idDeposito;

    showLoadingAlert();
    try {
      await axios.post('/inventario', data);
      showSuccessAlert('El equipo ha sido agregado al inventario correctamente');
      reset();
      onClose();
    } catch (error) {
      showErrorAlert('Hubo un problema al agregar el equipo al inventario');
      console.error('Error al agregar el equipo al inventario', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Agregar al Inventario</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de equipo</label>
            <select
              {...register('id_tipo_articulo')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            >
              <option value="">--Seleccione tipo de equipo--</option>
              {tipoArticulo.map(option => (
                <option key={option.id_tipo_articulo} value={option.id_tipo_articulo}>
                  {option.nombre}
                </option>
              ))}
            </select>
            {errors.id_tipo_articulo && (
              <p className="text-red-500 text-sm mt-1">{errors.id_tipo_articulo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marca</label>
            <select
              {...register('id_marca')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            >
              <option value="">--Seleccione marca--</option>
              {marcas.map(option => (
                <option key={option.id_marca} value={option.id_marca}>
                  {option.nombre }
                </option>
              ))}
            </select>
            {errors.id_marca && (
              <p className="text-red-500 text-sm mt-1">{errors.id_marca.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              {...register('modelo')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.modelo && <p className="text-red-500 text-sm mt-1">{errors.modelo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Service Tag</label>
            <input
              type="text"
              {...register('service_tag')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.service_tag && <p className="text-red-500 text-sm mt-1">{errors.service_tag.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Número de Serie</label>
            <input
              type="text"
              {...register('num_serie')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            />
            {errors.num_serie && <p className="text-red-500 text-sm mt-1">{errors.num_serie.message}</p>}
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventarioModal;
