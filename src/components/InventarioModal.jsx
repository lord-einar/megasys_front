// src/components/InventarioModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from '../services/axiosConfig';
import { inventarioSchema } from '../utils/validationSchemas';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';
import FormField from './FormField';

const InventarioModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(inventarioSchema),
  });
  const [idDeposito, setIdDeposito] = useState(null);

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

    fetchDepositoId();
  }, []);

  const onSubmit = async (data) => {
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
          <FormField label="Marca" type="text" register={register} name="marca" errors={errors} />
          <FormField label="Modelo" type="text" register={register} name="modelo" errors={errors} />
          <FormField label="Tipo de Artículo" type="text" register={register} name="tipo_articulo" errors={errors} />
          <FormField label="Service Tag" type="text" register={register} name="service_tag" errors={errors} />
          <FormField label="Número de Serie" type="text" register={register} name="num_serie" errors={errors} />
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
