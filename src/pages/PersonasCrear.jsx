// src/pages/PersonasCrear.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from '../services/axiosConfig';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';
import { personaSchema } from '../utils/validationSchemas';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';

const PersonasCrear = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(personaSchema),
  });
  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    const fetchRolesAndSedes = async () => {
      try {
        const [rolesResponse, sedesResponse] = await Promise.all([
          axios.get('/roles'),
          axios.get('/sedes')
        ]);
        setRoles(rolesResponse.data.map(rol => ({ value: rol.id_rol, label: rol.nombre })));
        setSedes(sedesResponse.data.map(sede => ({ value: sede.id_sede, label: sede.nombre })));
      } catch (error) {
        console.error('Error al obtener roles y sedes', error);
      }
    };

    fetchRolesAndSedes();
  }, []);

  const onSubmit = async (data) => {
    showLoadingAlert();
    
    try {
      // Crear la persona
      const personaResponse = await axios.post('/personas', {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono
      });
      
      const id_persona = personaResponse.data.id_persona;
      
      // Asignar rol y sede a la persona
      await axios.post('/sedepersona', {
        id_sede: data.id_sede,
        id_persona: id_persona,
        id_rol: data.id_rol
      });

      showSuccessAlert('La persona ha sido creada y asignada correctamente');
      reset();
    } catch (error) {
      showErrorAlert('Hubo un problema al crear la persona o asignar el rol y la sede');
      console.error('Error al crear la persona o asignar el rol y la sede', error);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Crear Persona</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-200 p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4 p-5">
          <FormField label="Nombre" name="nombre" register={register} errors={errors} />
          <FormField label="Email" name="email" type="email" register={register} errors={errors} />
          <FormField label="Teléfono" name="telefono" register={register} errors={errors} />
          <SelectField label="Rol" name="id_rol" options={roles} register={register} errors={errors} />
          <SelectField label="Sede" name="id_sede" options={sedes} register={register} errors={errors} />
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Crear Persona
        </button>
      </form>
    </div>
  );
};

export default PersonasCrear;
