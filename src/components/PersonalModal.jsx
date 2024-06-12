// src/components/PersonalModal.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from '../services/axiosConfig';
import { personaSchema } from '../utils/validationSchemas';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';

const PersonalModal = ({ isOpen, onClose, persona, roles, sedes }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(personaSchema),
  });

  useEffect(() => {
    if (persona) {
      setValue('nombre', persona.nombre);
      setValue('email', persona.email);
      setValue('telefono', persona.telefono);
      setValue('id_rol', persona.id_rol);
      setValue('id_sede', persona.id_sede);
    }
  }, [persona, setValue]);

  const onSubmit = async (data) => {
    showLoadingAlert();
    try {
      if (persona) {
        await axios.put(`/personas/${persona.id_persona}`, data);
        await axios.post('/sedepersona', {
          id_sede: data.id_sede,
          id_persona: persona.id_persona,
          id_rol: data.id_rol
        });
        showSuccessAlert('La persona ha sido modificada correctamente');
      } else {
        const personaResponse = await axios.post('/personas', {
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono
        });
        console.log(personaResponse)
        const id_persona = personaResponse.data.id_persona;
        await axios.post('/sedepersona', {
          id_sede: data.id_sede,
          id_persona: id_persona,
          id_rol: data.id_rol
        });
        showSuccessAlert('La persona ha sido creada correctamente');
      }
      reset();
      onClose();
    } catch (error) {
      showErrorAlert('Hubo un problema al crear o modificar la persona');
      console.error('Error al crear o modificar la persona', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{persona ? 'Modificar Persona' : 'Agregar Persona'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nombre" name="nombre" register={register} errors={errors} />
          <FormField label="Email" name="email" type="email" register={register} errors={errors} />
          <FormField label="Teléfono" name="telefono" register={register} errors={errors} />
          <SelectField label="Rol" name="id_rol" valueKey={'id_rol'} options={roles} register={register} errors={errors} />
          <SelectField label="Sede" name="id_sede" valueKey={'id_sede'} options={sedes} register={register} errors={errors} />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
              {persona ? 'Modificar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalModal;
