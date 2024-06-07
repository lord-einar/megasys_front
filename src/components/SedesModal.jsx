// src/components/SedesModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from '../services/axiosConfig';
import { sedeSchema } from '../utils/validationSchemas';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';
import FormField from './FormField';
import SelectField from './SelectField';

const SedesModal = ({ isOpen, onClose, sede }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(sedeSchema),
  });
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    if (sede) {
      setValue('nombre', sede.nombre);
      setValue('direccion', sede.direccion);
      setValue('localidad', sede.localidad);
      setValue('provincia', sede.provincia);
      setValue('pais', sede.pais);
      setValue('telefono', sede.telefono);
      setValue('email', sede.email);
      setValue('ip_asignada', sede.ip_asignada);
      setValue('id_empresa', sede.id_empresa);
    }
  }, [sede, setValue]);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await axios.get('/empresa');
        setEmpresas(response.data);
      } catch (error) {
        console.error('Error al obtener las empresas', error);
      }
    };
    fetchEmpresas();
  }, []);

  const onSubmit = async (data) => {
    showLoadingAlert();
    try {
      if (sede) {
        await axios.put(`/sedes/${sede.id_sede}`, data);
        showSuccessAlert('La sede ha sido modificada correctamente');
      } else {
        await axios.post('/sedes', data);
        showSuccessAlert('La sede ha sido creada correctamente');
      }
      reset();
      onClose();
    } catch (error) {
      showErrorAlert('Hubo un problema al crear o modificar la sede');
      console.error('Error al crear o modificar la sede', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{sede ? 'Modificar Sede' : 'Crear Sede'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombre" type="text" register={register} name="nombre" errors={errors} />
          <FormField label="Dirección" type="text" register={register} name="direccion" errors={errors} />
          <FormField label="Localidad" type="text" register={register} name="localidad" errors={errors} />
          <FormField label="Provincia" type="text" register={register} name="provincia" errors={errors} />
          <FormField label="País" type="text" register={register} name="pais" errors={errors} />
          <FormField label="Teléfono" type="text" register={register} name="telefono" errors={errors} />
          <FormField label="Email" type="email" register={register} name="email" errors={errors} />
          <FormField label="IP Asignada" type="text" register={register} name="ip_asignada" errors={errors} />
          <SelectField label="Empresa" register={register} name="id_empresa" options={empresas} errors={errors} />
          <div className="col-span-1 md:col-span-2 flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              {sede ? 'Modificar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SedesModal;
