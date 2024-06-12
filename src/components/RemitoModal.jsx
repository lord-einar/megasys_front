// src/components/RemitoModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from '../services/axiosConfig';
import { remitoSchema } from '../utils/validationSchemas';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';
import FormField from './FormField';
import SelectField from './SelectField';

const RemitoModal = ({ isOpen, onClose, remito, isViewMode }) => {
  const { register, handleSubmit, formState: { errors }, watch, reset, control, setValue } = useForm({
    resolver: yupResolver(remitoSchema),
    defaultValues: remito || {
      inventario: [{ id_inventario: '', es_prestamo: false }],
      fecha_remito: new Date().toISOString().split('T')[0] // Fecha actual por defecto
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inventario'
  });

  const [sedes, setSedes] = useState([]);
  const [inventarios, setInventarios] = useState([]);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get('/sedes');
        setSedes(response.data);
      } catch (error) {
        console.error('Error al obtener las sedes', error);
      }
    };

    const fetchInventarios = async () => {
      try {
        const response = await axios.get('/inventario');
        const depositoInventarios = response.data.filter(inventario => inventario.id_sede === 'd8bf1659-92d4-4d43-ba7f-e2b2d63e6fdc');
        setInventarios(depositoInventarios);
      } catch (error) {
        console.error('Error al obtener los inventarios', error);
      }
    };

    fetchSedes();
    fetchInventarios();
  }, []);

  useEffect(() => {
    if (remito) {
      reset(remito);
    }
  }, [remito, reset]);

  const onSubmit = async (data) => {
    showLoadingAlert();
    try {
      if (remito) {
        await axios.put(`/remitos/${remito.id_remito}`, data);
        showSuccessAlert('El remito ha sido modificado correctamente');
      } else {
        await axios.post('/remitos', data);
        showSuccessAlert('El remito ha sido creado correctamente');
      }
      reset();
      onClose();
    } catch (error) {
      showErrorAlert('Hubo un problema al crear o modificar el remito');
      console.error('Error al crear o modificar el remito', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">{remito ? (isViewMode ? 'Ver Remito' : 'Modificar Remito') : 'Crear Remito'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              key={sedes.id_sede}
              label="Sede"
              register={register}
              name="id_sede"
              options={sedes}
              valueKey={'id_sede'}
              errors={errors}
            />
            <FormField
              label="Solicitante"
              type="text"
              register={register}
              name="solicitante"
              errors={errors}
            />
            {!remito && (
              <FormField
                label="Fecha"
                type="date"
                register={register}
                name="fecha_remito"
                errors={errors}
              />
            )}
            <FormField
              label="Transportista"
              type="text"
              register={register}
              name="transportista"
              errors={errors}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Equipos</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-4 mb-2">
                <SelectField
                  label="Equipo"
                  register={register}
                  name={`inventario[${index}].id_inventario`}
                  valueKey={'id_inventario'}
                  options={inventarios}
                  errors={errors}
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`inventario[${index}].es_prestamo`)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">Préstamo</label>
                </div>
                {watch(`inventario[${index}].es_prestamo`) && (
                  <FormField
                    label="Fecha de Devolución"
                    type="date"
                    register={register}
                    name={`inventario[${index}].fecha_devolucion`}
                    errors={errors}
                    readOnly={isViewMode}
                  />
                )}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="py-1 px-3 rounded bg-red-700 text-white hover:text-red-700"
                  >
                    Eliminar
                  </button>
              </div>
            ))}
              <button
                type="button"
                onClick={() => append({ id_inventario: '', es_prestamo: false })}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Añadir Equipo
              </button>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
              Cerra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemitoModal;
