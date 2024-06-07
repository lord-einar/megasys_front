// src/pages/SedesModificar.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from '../services/axiosConfig';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';
import { sedeSchema } from '../utils/validationSchemas';
import FormField from '../components/FormField';
import EmpresaSelect from '../components/EmpresaSelect';

const SedesModificar = () => {
  const { id } = useParams();
  const [empresas, setEmpresas] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(sedeSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sedeResponse, empresasResponse] = await Promise.all([
          axios.get(`/sedes/id/${id}`),
          axios.get('/empresa')
        ]);

        const sede = sedeResponse.data.sede;
        setValue('id_empresa', sede.id_empresa); // Establece el valor del select
        reset(sede); // Inicializa el formulario con los datos de la sede
        setEmpresas(empresasResponse.data);
      } catch (error) {
        console.error('Error al obtener los datos', error);
      }
    };

    fetchData();
  }, [id, reset, setValue]);

  const onSubmit = data => {
    showLoadingAlert();

    axios.put(`/sedes/${id}`, data)
      .then(response => {
        showSuccessAlert('La sede ha sido modificada correctamente');
      })
      .catch(error => {
        showErrorAlert('Hubo un problema al modificar la sede');
        console.error('Error al modificar la sede', error);
      });
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Modificar Sede</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-200 p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4 p-5">
          <EmpresaSelect register={register} errors={errors} empresas={empresas} />
          <FormField label="Nombre" name="nombre" register={register} errors={errors} />
          <FormField label="Dirección" name="direccion" register={register} errors={errors} />
          <FormField label="Localidad" name="localidad" register={register} errors={errors} />
          <FormField label="Provincia" name="provincia" register={register} errors={errors} />
          <FormField label="País" name="pais" register={register} errors={errors} />
          <FormField label="Teléfono" name="telefono" register={register} errors={errors} />
          <FormField label="Email" name="email" type="email" register={register} errors={errors} />
          <FormField label="IP Asignada" name="ip_asignada" register={register} errors={errors} />
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Modificar Sede
        </button>
      </form>
    </div>
  );
};

export default SedesModificar;
